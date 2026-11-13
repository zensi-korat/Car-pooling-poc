import { z } from 'zod'
import { rideSchema, type Ride } from '@/features/shared/rides/api/rideSchema'
import { api } from '@/services/api'
import { rideBookingSchema, type RideBooking } from './ridesSchema'

const ridesSchema = z.array(rideSchema)
const rideBookingsSchema = z.array(rideBookingSchema)

// GET /api/rides/mine → every ride the driver posted, any status (a plain array, not paginated). 403 not a driver.
export function listMyRides(signal?: AbortSignal): Promise<Ride[]> {
  return api('/api/rides/mine', { signal, schema: ridesSchema })
}

// PATCH /api/rides/{id}/cancel → the cancelled ride. Its confirmed bookings are cancelled too.
// 409 already cancelled/completed, or it's already the day of departure (IST).
export function cancelRide(id: string): Promise<Ride> {
  return api(`/api/rides/${id}/cancel`, { method: 'PATCH', schema: rideSchema })
}

// PATCH /api/rides/{id}/complete → the completed ride, locked for good. 409 not departed yet, or already closed.
export function completeRide(id: string): Promise<Ride> {
  return api(`/api/rides/${id}/complete`, { method: 'PATCH', schema: rideSchema })
}

// GET /api/rides/{id}/bookings → every booking on the driver's own ride, cancelled ones included.
export function listRideBookings(id: string, signal?: AbortSignal): Promise<RideBooking[]> {
  return api(`/api/rides/${id}/bookings`, { signal, schema: rideBookingsSchema })
}
