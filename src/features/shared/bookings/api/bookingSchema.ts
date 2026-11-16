import { z } from 'zod'

export const bookingStatusSchema = z.enum(['CONFIRMED', 'CANCELLED'])
export type BookingStatus = z.infer<typeof bookingStatusSchema>

// The Booking schema (one booking = one seat). Checked against GET /api/rides/{id}/bookings, which has no
// rideId (Swagger lists one): check the rider's endpoints before adding fields only they send.
export const bookingSchema = z.object({
  id: z.string(),
  status: bookingStatusSchema,
  costShare: z.string(), // decimal as text; the ride's cost split among confirmed riders, changes as they come and go
  createdAt: z.string(),
})
export type Booking = z.infer<typeof bookingSchema>
