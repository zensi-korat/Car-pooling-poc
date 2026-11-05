import type { Role } from '@/features/auth/types'

// Every paginated admin list answers { items, total, page, pageSize }.
// <T> is the row type: Page<User> for users, later Page<Ride> for rides.
export type Page<T> = {
  items: T[]
  total: number // rows matching the filters, across ALL pages
  page: number
  pageSize: number
}

// Query parameters of GET /api/admin/users. All optional; the server fills in defaults
// (page 1, pageSize 50, max 200). Filters combine with AND. Always newest first.
export type ListUsersParams = {
  page?: number
  pageSize?: number
  role?: Role
  q?: string // case-insensitive match on name, email or phone
  joinedFrom?: string // YYYY-MM-DD (IST), inclusive
  joinedTo?: string // YYYY-MM-DD (IST), inclusive
}

// The filter part of ListUsersParams (everything except paging).
export type UserFilters = Omit<ListUsersParams, 'page' | 'pageSize'>

export type RideStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'

// Checked against a real response: the plate field is `plate`, not the Vehicle schema's `plateNumber`.
export type RideVehicle = {
  make: string
  model: string
  colour: string
  plate: string
}

// The Ride schema
export type Ride = {
  id: string
  driverId: string
  originLabel: string
  originLat: number
  originLng: number
  destLabel: string
  destLat: number
  destLng: number
  departureTime: string // ISO date-time, e.g. "2026-11-12T04:00:00.000Z"
  totalSeats: number
  seatsAvailable: number
  estimatedCost: string // decimal as text, e.g. "1200.00", never a float
  status: RideStatus
  vehicle: RideVehicle | null
}

// The admin list adds the driver
export type AdminRide = Ride & {
  driver: { id: string; name: string; email: string }
}

// Query parameters of GET /api/admin/rides. Same paging as users. Dates filter on departure time.
export type ListRidesParams = {
  page?: number
  pageSize?: number
  status?: RideStatus
  q?: string // case-insensitive match on origin/destination label or driver name/email
  departureFrom?: string // YYYY-MM-DD (IST), inclusive
  departureTo?: string // YYYY-MM-DD (IST), inclusive
}

export type RideFilters = Omit<ListRidesParams, 'page' | 'pageSize'>

export type AuditEntityType = 'Ride' | 'Booking' | 'Vehicle'

// One line of the audit trail, written by the server on every ride/booking/vehicle change.
export type AuditLog = {
  id: string
  entityType: AuditEntityType
  entityId: string // id of the ride/booking/vehicle that changed
  action: string // e.g. "CANCELLED"; Swagger gives examples, not a full list
  actorId: string // the user's id, or "system" for scheduled jobs
  metadata: Record<string, unknown> | null // differs per action, e.g. { reason: "AUTO_COMPLETED" }
  createdAt: string
}

// Query parameters of GET /api/admin/audit-logs. Same paging as users. No search.
export type ListAuditLogsParams = {
  page?: number
  pageSize?: number
  entityType?: AuditEntityType
  action?: string // exact action name
  from?: string // YYYY-MM-DD (IST), inclusive
  to?: string // YYYY-MM-DD (IST), inclusive
}

export type AuditLogFilters = Omit<ListAuditLogsParams, 'page' | 'pageSize'>
