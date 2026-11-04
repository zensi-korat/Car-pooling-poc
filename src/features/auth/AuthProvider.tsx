import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  signup as signupRequest,
  updateName as updateNameRequest,
  verifyPhone as verifyPhoneRequest,
} from './api/authApi'
import { setSessionExpiredHandler } from '@/services/api'
import type { LoginValues, SignupValues } from './types'
import { AuthContext, type AuthState } from './useAuth'

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null })
  const queryClient = useQueryClient()

  // Ending a session also empties the TanStack Query cache,
  // so the next person on this browser never sees the previous user's data.
  const endSession = useCallback(() => {
    queryClient.clear()
    setState({ status: 'unauthenticated', user: null })
  }, [queryClient])

  useEffect(() => {
    const controller = new AbortController()

    getMe(controller.signal)
      .then((user) => setState({ status: 'authenticated', user }))
      .catch(() => {
        // Cancelled by the cleanup below (StrictMode runs effects twice in dev): ignore it.
        if (controller.signal.aborted) return
        setState({ status: 'unauthenticated', user: null })
      })

    return () => controller.abort()
  }, [])

  // The refresh failed mid-use (e.g. after 7 days): show the user as logged out.
  // ProtectedRoute then sends them to /login, remembering the page they were on.
  useEffect(() => {
    setSessionExpiredHandler(endSession)
    return () => setSessionExpiredHandler(null)
  }, [endSession])

  const login = useCallback(async (values: LoginValues) => {
    const user = await loginRequest(values)
    setState({ status: 'authenticated', user })
    return user
  }, [])

  // Signup sets the same cookies as login, so the new user is logged in right away.
  const signup = useCallback(async (values: SignupValues) => {
    const user = await signupRequest(values)
    setState({ status: 'authenticated', user })
    return user
  }, [])

  // The server returns the updated user (phoneVerified: true); saving it updates the whole app.
  const verifyPhone = useCallback(async (code: string) => {
    const user = await verifyPhoneRequest(code)
    setState({ status: 'authenticated', user })
    return user
  }, [])

  // The saved user replaces the old one, so the header and every page show the new name.
  const updateName = useCallback(async (name: string) => {
    const user = await updateNameRequest(name)
    setState({ status: 'authenticated', user })
    return user
  }, [])

  // Logged out locally even if the request fails: the user asked to leave.
  // ProtectedRoute then sends them to /login.
  const logout = useCallback(async () => {
    await logoutRequest().catch(() => undefined)
    endSession()
  }, [endSession])

  // Same object until something changes, so useAuth() users don't re-render for nothing.
  const value = useMemo(
    () => ({ ...state, login, signup, verifyPhone, updateName, logout }),
    [state, login, signup, verifyPhone, updateName, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
