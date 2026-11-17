// Every page path in the app. Paths with params (":id") are filled with React Router's `generatePath`.
export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  verifyPhone: '/verify-phone',
  profile: '/profile',
  admin: {
    users: '/admin/users',
    rides: '/admin/rides',
    vehicles: '/admin/vehicles',
    auditLogs: '/admin/audit-logs',
  },
  driver: {
    vehicles: '/driver/vehicles',
    rides: '/driver/rides',
    newRide: '/driver/rides/new',
    editRide: '/driver/rides/:id/edit',
  },
  rider: {
    search: '/rider/search',
    bookings: '/rider/bookings',
  },
} as const
