import { z } from 'zod'

export const rideStatusSchema = z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED'])
export type RideStatus = z.infer<typeof rideStatusSchema>

// Checked against a real response: the plate field is `plate`, not the Vehicle schema's `plateNumber`.
export const rideVehicleSchema = z.object({
  make: z.string(),
  model: z.string(),
  colour: z.string(),
  plate: z.string(),
})
export type RideVehicle = z.infer<typeof rideVehicleSchema>

// The Ride schema
export const rideSchema = z.object({
  id: z.string(),
  driverId: z.string(),
  originLabel: z.string(),
  originLat: z.number(),
  originLng: z.number(),
  destLabel: z.string(),
  destLat: z.number(),
  destLng: z.number(),
  departureTime: z.string(), // ISO date-time, e.g. "2026-11-12T04:00:00.000Z"
  totalSeats: z.number(),
  seatsAvailable: z.number(),
  estimatedCost: z.string(), // decimal as text, e.g. "1200.00", never a float
  status: rideStatusSchema,
  vehicle: rideVehicleSchema.nullable(),
})
export type Ride = z.infer<typeof rideSchema>

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
