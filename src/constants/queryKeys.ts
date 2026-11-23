// Every TanStack Query key. Role first, so invalidating a shorter key (e.g. QUERY_KEYS.admin.all)
// refreshes every key that starts with it.
export const QUERY_KEYS = {
  admin: {
    all: ['admin'],
    users: (params: unknown) => ['admin', 'users', params],
    rides: (params: unknown) => ['admin', 'rides', params],
    vehicles: (params: unknown) => ['admin', 'vehicles', params],
    auditLogs: (params: unknown) => ['admin', 'audit-logs', params],
  },
  driver: {
    rides: ['driver', 'rides'],
    rideBookings: (rideId: string) => ['driver', 'rides', rideId, 'bookings'],
    vehicles: ['driver', 'vehicles'],
  },
  rider: {
    all: ['rider'],
    bookings: ['rider', 'bookings'],
    searchRides: (params: unknown) => ['rider', 'rides', 'search', params],
  },
  vehicleDocument: (vehicleId: string, type: string) => ['vehicles', vehicleId, 'documents', type],
  places: (query: string) => ['places', query],
  roadRoute: (ends: unknown) => ['road-route', ends],
} as const
