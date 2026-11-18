import { useNavigate } from 'react-router'
import { ROUTES } from '@/constants/routes'
import { logout as logoutRequest } from '../api/authApi'
import { useAuthStore } from '../authStore'

// Logged out locally even if the request fails: the user asked to leave.
// Straight to /login without remembering the page: the next person may have another role and land on
// "No access". endSession and navigate run together, so ProtectedRoute never sees the in-between state.
export function useLogout() {
  const endSession = useAuthStore((state) => state.endSession)
  const navigate = useNavigate()

  return async () => {
    await logoutRequest().catch(() => undefined)
    endSession()
    navigate(ROUTES.login, { replace: true })
  }
}
