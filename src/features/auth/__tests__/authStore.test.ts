import { beforeEach, describe, expect, it, vi } from 'vitest'
import { queryClient } from '@/lib/queryClient'
import { getMe, login, updateName } from '../api/authApi'
import type { User } from '../api/authSchema'
import { useAuthStore } from '../authStore'

// Every function in authApi becomes a fake: no real server. Each test says what the fake answers.
vi.mock('../api/authApi')

const ASHA: User = {
  id: 'u1',
  name: 'Asha Patel',
  email: 'asha@example.com',
  phone: '9876543210',
  roles: ['RIDER'],
  createdAt: '2026-11-01T10:00:00.000Z',
  phoneVerified: true,
}

// The store is shared by every test in this file: put the starting state back before each one.
const startState = useAuthStore.getState()

beforeEach(() => {
  useAuthStore.setState(startState, true)
  vi.resetAllMocks()
  vi.restoreAllMocks()
})

describe('login', () => {
  it('saves the user the server sends back', async () => {
    vi.mocked(login).mockResolvedValue(ASHA)

    await useAuthStore.getState().login({ email: 'asha@example.com', password: 'secret123' })

    expect(useAuthStore.getState()).toMatchObject({ status: 'authenticated', user: ASHA })
  })

  it('wrong password: the error reaches the page and the store does not change', async () => {
    vi.mocked(login).mockRejectedValue(new Error('Invalid email or password'))

    await expect(useAuthStore.getState().login({ email: 'asha@example.com', password: 'wrong' })).rejects.toThrow(
      'Invalid email or password',
    )

    expect(useAuthStore.getState()).toMatchObject({ status: 'loading', user: null })
  })
})

describe('checkSession', () => {
  it('the cookie still holds a session → logged in', async () => {
    vi.mocked(getMe).mockResolvedValue(ASHA)

    await useAuthStore.getState().checkSession()

    expect(useAuthStore.getState()).toMatchObject({ status: 'authenticated', user: ASHA })
  })

  it('no session → logged out (the failure is caught, not thrown)', async () => {
    vi.mocked(getMe).mockRejectedValue(new Error('Unauthorized'))

    await useAuthStore.getState().checkSession()

    expect(useAuthStore.getState()).toMatchObject({ status: 'unauthenticated', user: null })
  })
})

describe('updateName', () => {
  it('replaces the saved user, so every page shows the new name', async () => {
    useAuthStore.setState({ status: 'authenticated', user: ASHA })
    vi.mocked(updateName).mockResolvedValue({ ...ASHA, name: 'Asha P.' })

    await useAuthStore.getState().updateName('Asha P.')

    expect(useAuthStore.getState().user?.name).toBe('Asha P.')
  })
})

describe('endSession', () => {
  it('logs out and empties the TanStack Query cache', () => {
    useAuthStore.setState({ status: 'authenticated', user: ASHA })
    const clear = vi.spyOn(queryClient, 'clear')

    useAuthStore.getState().endSession()

    expect(useAuthStore.getState()).toMatchObject({ status: 'unauthenticated', user: null })
    expect(clear).toHaveBeenCalledOnce()
  })
})
