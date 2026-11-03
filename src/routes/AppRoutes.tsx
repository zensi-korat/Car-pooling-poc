import { Route, Routes } from 'react-router'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { SignupPage } from '@/pages/SignupPage'
import { VerifyPhonePage } from '@/pages/VerifyPhonePage'
import { GuestRoute, ProtectedRoute } from './guards'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/verify-phone" element={<VerifyPhonePage />} />
      </Route>

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
