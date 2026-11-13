import { z } from 'zod'
import { bookingSchema } from '@/features/shared/bookings/api/bookingSchema'

// A booking as the ride's driver sees it. The phone is sent only while the booking is CONFIRMED.
export const rideBookingSchema = bookingSchema.extend({
  riderName: z.string(),
  riderContact: z.object({ name: z.string(), phone: z.string() }).nullish(),
  cancelledAt: z.string().nullable(),
})
export type RideBooking = z.infer<typeof rideBookingSchema>
