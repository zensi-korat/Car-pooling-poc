import { createContext, useContext } from 'react'
import type { LoginValues, SignupValues, User } from './api/authSchema'

// "authenticated" always comes with a user; the other two never do.
// After `if (auth.status === 'authenticated')`, TypeScript knows `auth.user` is a User.
export type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated'; user: null }

export type AuthContextValue = AuthState & {
  login: (values: LoginValues) => Promise<User>
  signup: (values: SignupValues) => Promise<User>
  verifyPhone: (code: string) => Promise<User>
  updateName: (name: string) => Promise<User>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}

// For pages behind <ProtectedRoute>: the user is guaranteed, so no null checks needed.
export function useCurrentUser(): User {
  const auth = useAuth()
  if (auth.status !== 'authenticated') throw new Error('useCurrentUser must be used inside <ProtectedRoute>')
  return auth.user
}
