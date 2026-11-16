import { z } from 'zod'
import { bookingSchema } from '@/features/shared/bookings/api/bookingSchema'
import { rideStatusSchema, rideVehicleSchema } from '@/features/shared/rides/api/rideSchema'

// A booking as its rider sees it (GET /api/bookings/mine), checked against a real response.
// `status` is the booking's; `ride.status` is the trip's.
export const riderBookingSchema = bookingSchema.extend({
  rideId: z.string(),
  ride: z.object({
    originLabel: z.string(),
    destLabel: z.string(),
    departureTime: z.string(),
    status: rideStatusSchema,
  }),
  // The driver's contact is sent only while the booking is CONFIRMED.
  driverContact: z.object({ name: z.string(), phone: z.string() }).nullish(),
  vehicle: rideVehicleSchema.nullable(),
})
export type RiderBooking = z.infer<typeof riderBookingSchema>
