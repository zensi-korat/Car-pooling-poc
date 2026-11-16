import { z } from 'zod'
import { bookingSchema, type Booking } from '@/features/shared/bookings/api/bookingSchema'
import { rideSchema, type Ride } from '@/features/shared/rides/api/rideSchema'
import { api } from '@/services/api'
import type { SearchRidesParams } from './ridesSchema'

const ridesSchema = z.array(rideSchema)

// GET /api/rides/search → SCHEDULED rides on the route with a free seat, not yet departed, soonest first
// (at most 100, a plain array). No vehicle or driver details. 429 after 60 searches a minute.
export function searchRides(params: SearchRidesParams, signal?: AbortSignal): Promise<Ride[]> {
  return api('/api/rides/search', { params, signal, schema: ridesSchema })
}

// POST /api/rides/{id}/bookings (no body) → the CONFIRMED booking. Race-safe: when two riders want the last seat,
// one wins and the other gets 409 (no seats left, ride not open, or already departed). 429 after 10 tries a minute.
export function bookSeat(rideId: string): Promise<Booking> {
  return api(`/api/rides/${rideId}/bookings`, { method: 'POST', schema: bookingSchema })
}
