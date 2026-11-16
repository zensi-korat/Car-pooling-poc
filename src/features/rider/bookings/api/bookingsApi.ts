import { z } from 'zod'
import { api } from '@/services/api'
import { riderBookingSchema, type RiderBooking } from './bookingsSchema'

const bookingsSchema = z.array(riderBookingSchema)

// GET /api/bookings/mine → every booking of the rider, any status (a plain array, not paginated).
export function listMyBookings(signal?: AbortSignal): Promise<RiderBooking[]> {
  return api('/api/bookings/mine', { signal, schema: bookingsSchema })
}
