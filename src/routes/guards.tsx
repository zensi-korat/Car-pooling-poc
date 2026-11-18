import { Loader2, ShieldX } from 'lucide-react'
import { Link, Navigate, Outlet, useLocation } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { AppHeader } from '@/components/AppHeader'
import { PageHeader } from '@/components/page'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { roleSchema, type Role } from '@/features/auth/api/authSchema'
import { useAuthStore, useCurrentUser } from '@/features/auth/authStore'

// Pages for logged-in users only. Logged out → /login, remembering where they wanted to go.
// Unverified phone → /verify-phone first; already verified → no need to stay on /verify-phone.
export function ProtectedRoute() {
  const { status, user } = useSession()
  const location = useLocation()

  if (status === 'loading') return <SessionCheck />
  if (!user) return <Navigate to={ROUTES.login} replace state={{ from: location }} />

  const onVerifyPage = location.pathname === ROUTES.verifyPhone
  if (!user.phoneVerified && !onVerifyPage) return <Navigate to={ROUTES.verifyPhone} replace />
  if (user.phoneVerified && onVerifyPage) return <Navigate to={ROUTES.home} replace />
  return <Outlet />
}

// Pages for one role, e.g. <RoleRoute role="DRIVER" />. Sits inside ProtectedRoute + DashboardLayout,
// so the user exists and the sidebar stays. The server checks the role too (403); this only avoids
// showing a page that can't work.
export function RoleRoute({ role }: Readonly<{ role: Role }>) {
  const user = useCurrentUser()
  if (!user.roles.includes(role)) return <NoAccess />
  return <Outlet />
}

function NoAccess() {
  return (
    <>
      <PageHeader title="No access" description="Your account can't open this page." />
      <div className="flex flex-col items-start gap-4 p-6">
        <ShieldX className="size-10 text-muted-foreground" aria-hidden />
        <Button asChild variant="outline">
          <Link to={ROUTES.home}>Back to Dashboard</Link>
        </Button>
      </div>
    </>
  )
}

// Pages for logged-out users only (login, signup). Logged in → back to where they wanted to go.
export function GuestRoute() {
  const { status, user } = useSession()
  const location = useLocation()

  if (status === 'loading') return <SessionCheck />
  if (user) return <Navigate to={redirectTarget(location.state, user.roles)} replace />
  return <Outlet />
}

// Two values in one selector: useShallow compares the values inside, not the new object around them.
function useSession() {
  return useAuthStore(useShallow((state) => ({ status: state.status, user: state.user })))
}

// `state` is unknown (anything could be in it), so check it before trusting it.
// Only paths inside this app: "/rides" is fine, "//evil.com" (another website) is not.
function redirectTarget(state: unknown, roles: Role[]): string {
  const from = (state as { from?: { pathname?: unknown; search?: unknown; hash?: unknown } } | null)?.from
  if (typeof from?.pathname !== 'string') return ROUTES.home
  if (!from.pathname.startsWith('/') || from.pathname.startsWith('//')) return ROUTES.home

  // Another role's page (/rider/…, /admin/…) was remembered from someone else's session: the dashboard instead.
  const path = from.pathname
  const pageRole = roleSchema.options.find((role) => path.startsWith(`/${role.toLowerCase()}/`))
  if (pageRole && !roles.includes(pageRole)) return ROUTES.home

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
