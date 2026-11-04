import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../ApiError'
import { api, http, setSessionExpiredHandler } from '../axiosClient'

// No backend needed: we replace the global fetch with a fake that returns
// whatever Response we want, then check what api() did with it.
function mockFetch(response: Response | Error) {
  const fake = vi.fn((..._args: unknown[]) =>
    response instanceof Error ? Promise.reject(response) : Promise.resolve(response),
  )
  vi.stubGlobal('fetch', fake)
  return fake
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

// What was actually sent? axios calls fetch(request, init); new Request(...) lets us read it.
function sentRequest(fake: ReturnType<typeof mockFetch>) {
  const [input, init] = fake.mock.calls[0] as [RequestInfo, RequestInit?]
  return new Request(input, init)
}

// In the browser axios uses XMLHttpRequest; in Node it uses the http module.
// Its 'fetch' adapter makes it go through the global fetch, so our fake catches it.
beforeAll(() => {
  http.defaults.adapter = 'fetch'
})

afterEach(() => vi.unstubAllGlobals())

describe('api()', () => {
  it('returns the parsed JSON on success', async () => {
    mockFetch(json(200, { user: { id: '1', name: 'Asha' } }))
    await expect(api('/api/auth/me')).resolves.toEqual({ user: { id: '1', name: 'Asha' } })
  })

  it('GET: no X-Requested-With header, but cookies are included', async () => {
    const fake = mockFetch(json(200, {}))
    await api('/api/auth/me')

    const req = sentRequest(fake)
    expect(req.url).toBe('http://localhost:5173/api/auth/me') // base URL from .env.test
    expect(req.method).toBe('GET')
    expect(req.headers.get('X-Requested-With')).toBeNull()
    expect(req.credentials).toBe('include')
  })

  it('POST: sends JSON + the X-Requested-With header the backend requires', async () => {
    const fake = mockFetch(json(200, {}))
    await api('/api/auth/login', { method: 'POST', body: { email: 'a@b.co', password: 'secret123' } })

    const req = sentRequest(fake)
    expect(req.method).toBe('POST')
    expect(await req.text()).toBe('{"email":"a@b.co","password":"secret123"}')
    expect(req.headers.get('Content-Type')).toContain('application/json')
    expect(req.headers.get('X-Requested-With')).toBe('XMLHttpRequest')
  })

  it('params → query string, and undefined values are left out', async () => {
    const fake = mockFetch(json(200, {}))
    await api('/api/admin/users', { params: { page: 2, pageSize: 50, role: 'RIDER', q: undefined } })

    expect(sentRequest(fake).url).toBe('http://localhost:5173/api/admin/users?page=2&pageSize=50&role=RIDER')
  })

  it("keeps the SERVER's error and message in the ApiError", async () => {
    mockFetch(json(401, { error: 'UnauthenticatedError', message: 'Invalid email or password' }))

    const err = await api('/api/auth/login', { method: 'POST', body: {} }).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ status: 401, code: 'UnauthenticatedError', message: 'Invalid email or password' })
  })

  it('400 with "details" (no message) → a readable summary, first message per field', async () => {
    // The real reply from POST /api/auth/signup with invalid name + phone.
    mockFetch(
      json(400, {
        error: 'ValidationError',
        details: {
          name: ['name is required'],
          phone: ['enter a valid 10-digit Indian mobile number', 'a second message we ignore'],
        },
      }),
    )

    const err = await api('/api/auth/signup', { method: 'POST', body: {} }).catch((e: unknown) => e)
    expect(err).toMatchObject({
      status: 400,
      code: 'ValidationError',
      message: 'Name: name is required. Phone: enter a valid 10-digit Indian mobile number',
    })
  })

  it('no message from the server (e.g. a proxy 502 in plain text) → our fallback message', async () => {
    mockFetch(new Response('Bad Gateway', { status: 502 }))
    await expect(api('/api/auth/me')).rejects.toMatchObject({
      status: 502,
      code: 'HttpError',
      message: "The server isn't responding properly (502). Please try again in a moment.",
    })
  })

  it('network failure (no response at all) → ApiError with status 0', async () => {
    mockFetch(new TypeError('Failed to fetch'))
    await expect(api('/api/auth/me')).rejects.toMatchObject({ status: 0, code: 'NetworkError' })
  })

  it('a cancelled request is NOT turned into an ApiError', async () => {
    mockFetch(new DOMException('aborted', 'AbortError'))
    const controller = new AbortController()
    controller.abort()

    const err = await api('/api/auth/me', { signal: controller.signal }).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(Error)
    expect(err).not.toBeInstanceOf(ApiError)
  })

  it('204 No Content → resolves to undefined', async () => {
    mockFetch(new Response(null, { status: 204 }))
    await expect(api('/api/auth/logout', { method: 'POST' })).resolves.toBeUndefined()
  })
})

describe('silent refresh on 401', () => {
  const ME_401 = { error: 'UnauthenticatedError', message: 'Authentication required' }

  // A fake server: answers by URL, and remembers every URL it was called with.
  function mockServer(handler: (path: string) => Response) {
    const calls: string[] = []
    vi.stubGlobal('fetch', (input: RequestInfo, init?: RequestInit) => {
      const path = new URL(new Request(input, init).url).pathname
      calls.push(path)
      return Promise.resolve(handler(path))
    })
    return calls
  }

  it('401 → refreshes once → resends the request → the caller gets the data', async () => {
    let refreshed = false
    const calls = mockServer((path) => {
      if (path === '/api/auth/refresh') {
        refreshed = true
        return json(200, { user: {} })
      }
      return refreshed ? json(200, { user: { id: '1' } }) : json(401, ME_401)
    })

    await expect(api('/api/auth/me')).resolves.toEqual({ user: { id: '1' } })
    expect(calls).toEqual(['/api/auth/me', '/api/auth/refresh', '/api/auth/me'])
  })

  it('the refresh fails too → the ORIGINAL 401 reaches the caller', async () => {
    const calls = mockServer((path) =>
      path === '/api/auth/refresh'
        ? json(401, { error: 'UnauthenticatedError', message: 'Refresh token required' })
        : json(401, ME_401),
    )

    await expect(api('/api/auth/me')).rejects.toMatchObject({ status: 401, message: 'Authentication required' })
    expect(calls).toEqual(['/api/auth/me', '/api/auth/refresh'])
  })

  it('a wrong password (401 on /login) does NOT try to refresh', async () => {
    const calls = mockServer(() => json(401, { error: 'UnauthenticatedError', message: 'Invalid email or password' }))

    await expect(api('/api/auth/login', { method: 'POST', body: {} })).rejects.toMatchObject({ status: 401 })
    expect(calls).toEqual(['/api/auth/login'])
  })

  it('still 401 after a successful refresh → gives up (no endless loop)', async () => {
    const calls = mockServer((path) => (path === '/api/auth/refresh' ? json(200, {}) : json(401, ME_401)))

    await expect(api('/api/auth/me')).rejects.toMatchObject({ status: 401 })
    expect(calls).toEqual(['/api/auth/me', '/api/auth/refresh', '/api/auth/me'])
  })

  it('3 requests get 401 at the same time → only ONE refresh', async () => {
    let refreshed = false
    const calls = mockServer((path) => {
      if (path === '/api/auth/refresh') {
        refreshed = true
        return json(200, {})
      }
      return refreshed ? json(200, { ok: true }) : json(401, ME_401)
    })

    await Promise.all([api('/api/rides'), api('/api/bookings'), api('/api/auth/me')])
    expect(calls.filter((path) => path === '/api/auth/refresh')).toHaveLength(1)
  })

  it('the refresh fails → tells the app the session is over', async () => {
    const onExpired = vi.fn()
    setSessionExpiredHandler(onExpired)
    mockServer(() => json(401, ME_401))

    await api('/api/auth/me').catch(() => undefined)
    expect(onExpired).toHaveBeenCalledTimes(1)
    setSessionExpiredHandler(null)
  })

  it('the refresh works → the app is NOT told anything', async () => {
    const onExpired = vi.fn()
    setSessionExpiredHandler(onExpired)
    let refreshed = false
    mockServer((path) => {
      if (path === '/api/auth/refresh') {
        refreshed = true
        return json(200, {})
      }
      return refreshed ? json(200, {}) : json(401, ME_401)
    })

    await api('/api/auth/me')
    expect(onExpired).not.toHaveBeenCalled()
    setSessionExpiredHandler(null)
  })
})
