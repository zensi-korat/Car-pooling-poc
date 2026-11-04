// Every auth request lives here. Pages call these functions and never
// write URLs or know the response shapes themselves.

import { api } from '@/services/api'
import type { LoginValues, SignupValues, User } from '../types'

// Every auth endpoint answers { user: {...} }.
type UserResponse = { user: User }

// POST /api/auth/login
// On success the server ALSO sets the httpOnly `token` + `refresh_token`
// cookies. The browser stores them by itself; our code never sees them.
// On failure api() throws an ApiError (401 wrong password, 429 too many tries…).
export async function login(values: LoginValues): Promise<User> {
  const data = await api<UserResponse>('/api/auth/login', { method: 'POST', body: values })
  return data.user
}

// GET /api/auth/me: "who is logged in?" The browser sends the httpOnly cookie itself.
// 200 → the user. No/expired cookie → 401 ApiError (the caller treats it as "logged out").
// `signal` lets the caller cancel the request (e.g. when a component unmounts).
export async function getMe(signal?: AbortSignal): Promise<User> {
  const data = await api<UserResponse>('/api/auth/me', { signal })
  return data.user
}

// POST /api/auth/signup → 201 { user }, and sets the same cookies as login,
// so the new user is logged in straight away (with phoneVerified: false).
// On failure: 400 ValidationError, 409 email taken, 429 too many signups.
export async function signup(values: SignupValues): Promise<User> {
  const data = await api<UserResponse>('/api/auth/signup', { method: 'POST', body: values })
  return data.user
}

// POST /api/auth/verify-phone with the 6-digit SMS code → the user, now phoneVerified: true.
// The cookie tells the server whose phone it is. 400 wrong code, 409 already verified, 429 too many tries.
export async function verifyPhone(code: string): Promise<User> {
  const data = await api<UserResponse>('/api/auth/verify-phone', { method: 'POST', body: { code } })
  return data.user
}

// PATCH /api/auth/me with { name } → the updated user. Only the name can change.
// 400 blank name, 401 no session.
export async function updateName(name: string): Promise<User> {
  const data = await api<UserResponse>('/api/auth/me', { method: 'PATCH', body: { name } })
  return data.user
}

// POST /api/auth/logout → revokes the refresh token and deletes both cookies.
// Always succeeds, even with no session.
export async function logout(): Promise<void> {
  await api('/api/auth/logout', { method: 'POST' })
}

export type ResendCodeResponse = { message: string; resendAfterSeconds: number }

// POST /api/auth/verify-phone/resend → a new SMS, plus how long to wait before asking again.
// 429 = still waiting (or the hourly limit), 502 = the SMS provider failed.
export function resendCode(): Promise<ResendCodeResponse> {
  return api<ResendCodeResponse>('/api/auth/verify-phone/resend', { method: 'POST' })
}
