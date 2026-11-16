import { z } from 'zod'
import { bookingSchema } from '@/features/shared/bookings/api/bookingSchema'
import type { Place } from '@/features/shared/places/api/placesSchema'

// A booking as the ride's driver sees it. The phone is sent only while the booking is CONFIRMED.
export const rideBookingSchema = bookingSchema.extend({
  riderName: z.string(),
  riderContact: z.object({ name: z.string(), phone: z.string() }).nullish(),
  cancelledAt: z.string().nullable(),
})
export type RideBooking = z.infer<typeof rideBookingSchema>

// The ride form (post and edit). The server checks everything again (and knows the allowed fare range for the route).
export const rideFormSchema = z
  .object({
    origin: z.custom<Place | null>((place) => place !== null, 'Choose where the ride starts'),
    destination: z.custom<Place | null>((place) => place !== null, 'Choose where the ride ends'),
    departureTime: z
      .string()
      .min(1, 'Choose when you leave')
      .refine((time) => new Date(time) > new Date(), 'Pick a time in the future'),
    estimatedCost: z
      .string()
      .trim()
      .min(1, 'Enter the total fare')
      .regex(/^\d+(\.\d{1,2})?$/, 'Enter an amount like 1200 or 1200.50'),
    vehicleId: z.string().min(1, 'Choose a vehicle'),
  })
  // Compared by coordinates: a ride loaded for editing has no LocationIQ id.
  .refine(
    ({ origin, destination }) =>
      !origin || !destination || origin.lat !== destination.lat || origin.lng !== destination.lng,
    {
      message: 'Pick a different place than the start',
      path: ['destination'],
    },
  )
export type RideFormValues = z.infer<typeof rideFormSchema>

// POST /api/rides and PATCH /api/rides/{id} body. totalSeats is left out: the server takes it from the vehicle.
export type RideBody = {
  originLabel: string
  originLat: number
  originLng: number
  destLabel: string
  destLat: number
  destLng: number
  departureTime: string // ISO date-time
  estimatedCost: string // decimal as text, e.g. "1200.00"
  vehicleId: string
}
