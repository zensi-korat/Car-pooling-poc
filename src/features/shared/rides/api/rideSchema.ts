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
  // Only /api/rides/mine and the admin list send it; cancel, complete and search leave it out.
  vehicle: rideVehicleSchema.nullish(),
})
export type Ride = z.infer<typeof rideSchema>
