import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  signup as signupRequest,
  verifyPhone as verifyPhoneRequest,
} from './api/authApi'
import type { LoginValues, SignupValues } from './types'
import { AuthContext, type AuthState } from './useAuth'

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null })

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

  // Logged out locally even if the request fails: the user asked to leave.
  // ProtectedRoute then sends them to /login.
  const logout = useCallback(async () => {
    await logoutRequest().catch(() => undefined)
    setState({ status: 'unauthenticated', user: null })
  }, [])

  // Same object until something changes, so useAuth() users don't re-render for nothing.
  const value = useMemo(
    () => ({ ...state, login, signup, verifyPhone, logout }),
    [state, login, signup, verifyPhone, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
