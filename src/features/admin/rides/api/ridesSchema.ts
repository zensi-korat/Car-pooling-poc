import { z } from 'zod'
import { rideSchema, type RideStatus } from '@/features/shared/rides/api/rideSchema'

// The admin list adds the driver
export const adminRideSchema = rideSchema.extend({
  driver: z.object({ id: z.string(), name: z.string(), email: z.string() }),
})
export type AdminRide = z.infer<typeof adminRideSchema>

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
