import { Route, Routes } from 'react-router'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { AdminAuditLogsPage } from '@/pages/admin/AdminAuditLogsPage'
import { AdminRidesPage } from '@/pages/admin/AdminRidesPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminVehiclesPage } from '@/pages/admin/AdminVehiclesPage'
import { DriverEditRidePage } from '@/pages/driver/DriverEditRidePage'
import { DriverPostRidePage } from '@/pages/driver/DriverPostRidePage'
import { DriverRidesPage } from '@/pages/driver/DriverRidesPage'
import { DriverVehiclesPage } from '@/pages/driver/DriverVehiclesPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { RiderBookingsPage } from '@/pages/rider/RiderBookingsPage'
import { RiderSearchPage } from '@/pages/rider/RiderSearchPage'
import { SignupPage } from '@/pages/SignupPage'
import { VerifyPhonePage } from '@/pages/VerifyPhonePage'
import { GuestRoute, ProtectedRoute, RoleRoute } from './guards'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/verify-phone" element={<VerifyPhonePage />} />

        <Route element={<DashboardLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<RoleRoute role="ADMIN" />}>
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/rides" element={<AdminRidesPage />} />
            <Route path="/admin/vehicles" element={<AdminVehiclesPage />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
          </Route>

          <Route element={<RoleRoute role="DRIVER" />}>
            <Route path="/driver/vehicles" element={<DriverVehiclesPage />} />
            <Route path="/driver/rides" element={<DriverRidesPage />} />
            <Route path="/driver/rides/new" element={<DriverPostRidePage />} />
            <Route path="/driver/rides/:id/edit" element={<DriverEditRidePage />} />
          </Route>

          <Route element={<RoleRoute role="RIDER" />}>
            <Route path="/rider/search" element={<RiderSearchPage />} />
            <Route path="/rider/bookings" element={<RiderBookingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
