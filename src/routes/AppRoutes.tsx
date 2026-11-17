import { Route, Routes } from 'react-router'
import { ROUTES } from '@/constants/routes'
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
        <Route path={ROUTES.verifyPhone} element={<VerifyPhonePage />} />

        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.profile} element={<ProfilePage />} />

          <Route element={<RoleRoute role="ADMIN" />}>
            <Route path={ROUTES.admin.users} element={<AdminUsersPage />} />
            <Route path={ROUTES.admin.rides} element={<AdminRidesPage />} />
            <Route path={ROUTES.admin.vehicles} element={<AdminVehiclesPage />} />
            <Route path={ROUTES.admin.auditLogs} element={<AdminAuditLogsPage />} />
          </Route>

          <Route element={<RoleRoute role="DRIVER" />}>
            <Route path={ROUTES.driver.vehicles} element={<DriverVehiclesPage />} />
            <Route path={ROUTES.driver.rides} element={<DriverRidesPage />} />
            <Route path={ROUTES.driver.newRide} element={<DriverPostRidePage />} />
            <Route path={ROUTES.driver.editRide} element={<DriverEditRidePage />} />
          </Route>

          <Route element={<RoleRoute role="RIDER" />}>
            <Route path={ROUTES.rider.search} element={<RiderSearchPage />} />
            <Route path={ROUTES.rider.bookings} element={<RiderBookingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<GuestRoute />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.signup} element={<SignupPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
