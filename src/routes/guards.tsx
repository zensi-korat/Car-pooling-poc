import { Loader2 } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { AppHeader } from '@/components/AppHeader'
import { useAuth } from '@/features/auth/useAuth'

// Pages for logged-in users only. Logged out → /login, remembering where they wanted to go.
// Unverified phone → /verify-phone first; already verified → no need to stay on /verify-phone.
export function ProtectedRoute() {
  const auth = useAuth()
  const location = useLocation()

  if (auth.status === 'loading') return <SessionCheck />
  if (auth.status === 'unauthenticated') return <Navigate to="/login" replace state={{ from: location }} />

  const onVerifyPage = location.pathname === '/verify-phone'
  if (!auth.user.phoneVerified && !onVerifyPage) return <Navigate to="/verify-phone" replace />
  if (auth.user.phoneVerified && onVerifyPage) return <Navigate to="/" replace />
  return <Outlet />
}

// Pages for logged-out users only (login, signup). Logged in → back to where they wanted to go.
export function GuestRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <SessionCheck />
  if (status === 'authenticated') return <Navigate to={redirectTarget(location.state)} replace />
  return <Outlet />
}

// `state` is unknown (anything could be in it), so check it before trusting it.
// Only paths inside this app: "/rides" is fine, "//evil.com" (another website) is not.
function redirectTarget(state: unknown): string {
  const from = (state as { from?: { pathname?: unknown; search?: unknown; hash?: unknown } } | null)?.from
  if (typeof from?.pathname !== 'string') return '/'
  if (!from.pathname.startsWith('/') || from.pathname.startsWith('//')) return '/'

  const search = typeof from.search === 'string' ? from.search : ''
  const hash = typeof from.hash === 'string' ? from.hash : ''
  return from.pathname + search + hash
}

function SessionCheck() {
  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pb-16 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-hidden />
        <p aria-live="polite">Checking your session…</p>
      </main>
    </div>
  )
}
