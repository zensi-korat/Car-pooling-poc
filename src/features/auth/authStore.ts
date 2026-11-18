import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { queryClient } from '@/lib/queryClient'
import { setSessionExpiredHandler } from '@/services/api'
import {
  getMe,
  login as loginRequest,
  signup as signupRequest,
  updateName as updateNameRequest,
  verifyPhone as verifyPhoneRequest,
} from './api/authApi'
import type { LoginValues, SignupValues, User } from './api/authSchema'

// "authenticated" always comes with a user; the other two never do.
type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated'; user: null }

type AuthStore = AuthState & {
  checkSession: () => Promise<void>
  login: (values: LoginValues) => Promise<User>
  signup: (values: SignupValues) => Promise<User>
  verifyPhone: (code: string) => Promise<User>
  updateName: (name: string) => Promise<User>
  endSession: () => void
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => {
      // Every request that returns the user (login, signup, verify, rename) saves it the same way.
      // `action` is the name shown in Redux DevTools.
      function signIn(user: User, action: string) {
        set({ status: 'authenticated', user }, false, action)
        return user
      }

      return {
        status: 'loading',
        user: null,

        // Runs once when the app starts: the httpOnly cookie may still hold a session.
        checkSession: async () => {
          try {
            signIn(await getMe(), 'auth/checkSession')
          } catch {
            set({ status: 'unauthenticated', user: null }, false, 'auth/checkSession')
          }
        },

        // Signup sets the same cookies as login, so the new user is logged in right away.
        login: async (values) => signIn(await loginRequest(values), 'auth/login'),
        signup: async (values) => signIn(await signupRequest(values), 'auth/signup'),
        verifyPhone: async (code) => signIn(await verifyPhoneRequest(code), 'auth/verifyPhone'),
        updateName: async (name) => signIn(await updateNameRequest(name), 'auth/updateName'),

        // Also empties the TanStack Query cache, so the next person on this browser never sees the previous user's data.
        endSession: () => {
          queryClient.clear()
          set({ status: 'unauthenticated', user: null }, false, 'auth/endSession')
        },
      }
    },
    { name: 'auth' },
  ),
)

// The refresh failed mid-use (e.g. after 7 days): show the user as logged out.
// ProtectedRoute then sends them to /login, remembering the page they were on.
setSessionExpiredHandler(() => useAuthStore.getState().endSession())

// For pages behind <ProtectedRoute>: the user is guaranteed, so no null checks needed.
export function useCurrentUser(): User {
  const user = useAuthStore((state) => state.user)
  if (!user) throw new Error('useCurrentUser must be used inside <ProtectedRoute>')
  return user
}
