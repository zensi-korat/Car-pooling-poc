import { api } from '@/services/api'
import { bookingSchema, type Booking } from './bookingSchema'

// PATCH /api/bookings/{id}/cancel → the cancelled booking; the seat goes back to the ride and the other riders'
// shares are recalculated. Allowed for the booking's rider and the ride's driver (403 anyone else).
// 409 already cancelled, the ride is no longer SCHEDULED, or it's already the day of departure (IST).
export function cancelBooking(id: string): Promise<Booking> {
  return api(`/api/bookings/${id}/cancel`, { method: 'PATCH', schema: bookingSchema })
}
