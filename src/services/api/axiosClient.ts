// The app's HTTP client, built on axios. Every request goes through api().

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { z } from 'zod'
import { env } from '@/config/env'
import { ApiError, INVALID_RESPONSE_MESSAGE, NETWORK_ERROR_MESSAGE, type ApiOptions, type ErrorBody } from './ApiError'

// ① An INSTANCE: settings shared by every request made through `http`.
//    (bear-portal-new does the same in baseApiService.ts.)
export const http = axios.create({
  // '' = same origin (Vite proxy in dev). Set VITE_API_BASE_URL in .env to go cross-origin.
  baseURL: env.apiBaseUrl,
  // = fetch's credentials: 'include'. Send/accept cookies even cross-origin.
  withCredentials: true,
  headers: { Accept: 'application/json' },
  // fetch has no built-in timeout; axios does. Give up after 15 s.
  timeout: 15_000,
})

// ② REQUEST INTERCEPTOR: runs just before EVERY request is sent.
//    Backend rule: every mutating request must carry this header (CSRF defense).
http.interceptors.request.use((config) => {
  if (config.method && config.method.toUpperCase() !== 'GET') {
    config.headers.set('X-Requested-With', 'XMLHttpRequest')
  }
  return config
})

// ③ RESPONSE INTERCEPTOR: runs after EVERY response.
//    1st function = success (2xx): pass it through untouched.
//    2nd function = failure: axios ALREADY threw for 4xx/5xx (fetch doesn't).
//    On a 401 we try ONE silent refresh and resend the request; otherwise
//    we translate its AxiosError into our own ApiError.
http.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!shouldRefresh(error)) throw toApiError(error)

    error.config._retried = true
    try {
      await refreshSession()
    } catch {
      onSessionExpired?.()
      throw toApiError(error)
    }
    return http.request(error.config)
  },
)

// This file isn't React, so it can't change the auth state itself.
// The AuthProvider registers a function here, and we call it when the session is over.
let onSessionExpired: (() => void) | null = null

export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler
}

// A 401 here can't be fixed by refreshing: a wrong password, or the refresh itself failing.
const NO_REFRESH_URLS = new Set(['/api/auth/login', '/api/auth/signup', '/api/auth/refresh', '/api/auth/logout'])

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

function shouldRefresh(error: unknown): error is AxiosError & { config: RetryableConfig } {
  if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) return false
  const config: RetryableConfig = error.config
  return !config._retried && !NO_REFRESH_URLS.has(config.url ?? '')
}

// The refresh token works only ONCE, so parallel 401s must share one refresh.
// While a refresh is running, everyone gets the same Promise.
let refreshing: Promise<void> | null = null

function refreshSession(): Promise<void> {
  refreshing ??= http
    .post('/api/auth/refresh')
    .then(() => undefined)
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

function toApiError(error: unknown): unknown {
  // Cancelled on purpose (AbortController): let the caller ignore it.
  if (axios.isCancel(error)) return error
  if (!axios.isAxiosError(error)) return error

  // A request was sent but NO response came back: offline, server down, timeout, CORS block.
  if (!error.response) {
    const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
    return new ApiError(0, timedOut ? 'TimeoutError' : 'NetworkError', NETWORK_ERROR_MESSAGE)
  }

  // A response came back with 4xx/5xx. axios already parsed the body; it's
  // an object if the server sent JSON, or a plain string (e.g. a proxy's 502).
  const { status, data } = error.response
  const body: ErrorBody = typeof data === 'object' && data !== null ? data : {}
  // Prefer the SERVER's own words: its message, else its per-field messages, else our fallback.
  const message = body.message ?? (summarize(body.details) || fallbackMessage(status))
  return new ApiError(status, body.error ?? 'HttpError', message)
}

// { phone: ['enter a valid…', 'msg 2'], name: ['name is required'] }
//   → "Phone: enter a valid…. Name: name is required" (the first message per field is enough)
function summarize(details: ErrorBody['details']): string {
  return Object.entries(details ?? {})
    .filter(([, messages]) => Array.isArray(messages) && typeof messages[0] === 'string')
    .map(([field, messages]) => `${field.charAt(0).toUpperCase()}${field.slice(1)}: ${messages[0]}`)
    .join('. ')
}

// Only used when the server sent no message (e.g. a proxy's plain-text "Bad Gateway").
function fallbackMessage(status: number): string {
  if (status >= 500) return `The server isn't responding properly (${status}). Please try again in a moment.`
  return `Something went wrong (${status}). Please try again.`
}

// The function the whole app calls:
//   api('/api/auth/me', { schema: userResponseSchema })  → checked, typed from the schema
//   api<{ ok: true }>('/api/x')                            → unchecked, typed by hand
export async function api<T>(
  path: string,
  { method = 'GET', body, params, signal, schema }: ApiOptions<T> = {},
): Promise<T> {
  // ④ `data` = the body. axios turns the object into JSON AND sets
  //    Content-Type: application/json for us. The reply is already parsed: response.data.
  const response = await http.request<T>({ url: path, method, data: body, params, signal })
  // 204 No Content: axios gives back an empty string; we normalize it to undefined.
  const data = response.status === 204 ? undefined : response.data
  return schema ? parseResponse(schema, data, response.status, path) : (data as T)
}

// A response that doesn't match its schema becomes an ApiError like any other failure,
// so screens show one friendly sentence. The exact mismatch goes to the console for us.
function parseResponse<T>(schema: z.ZodType<T>, data: unknown, status: number, path: string): T {
  const result = schema.safeParse(data)
  if (result.success) return result.data
  console.error(`Unexpected response from ${path}:\n${z.prettifyError(result.error)}`)
  throw new ApiError(status, 'InvalidResponseError', INVALID_RESPONSE_MESSAGE)
}
