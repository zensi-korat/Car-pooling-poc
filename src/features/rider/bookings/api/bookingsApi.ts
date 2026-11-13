import { z } from 'zod'
import { bookingSchema, type Booking } from '@/features/shared/bookings/api/bookingSchema'
import { api } from '@/services/api'
import { riderBookingSchema, type RiderBooking } from './bookingsSchema'

const bookingsSchema = z.array(riderBookingSchema)

// GET /api/bookings/mine → every booking of the rider, any status (a plain array, not paginated).
export function listMyBookings(signal?: AbortSignal): Promise<RiderBooking[]> {
  return api('/api/bookings/mine', { signal, schema: bookingsSchema })
}

// PATCH /api/bookings/{id}/cancel → the cancelled booking; the seat goes back to the ride.
// 409 already cancelled, the ride is no longer SCHEDULED, or it's already the day of departure (IST).
export function cancelBooking(id: string): Promise<Booking> {
  return api(`/api/bookings/${id}/cancel`, { method: 'PATCH', schema: bookingSchema })
}
