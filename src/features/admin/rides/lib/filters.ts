import { readDateRange, readSearch } from '@/lib/filters'
import { rideStatusSchema, type RideFilters } from '../api/ridesSchema'

export const RIDE_STATUSES = rideStatusSchema.options

export function readRideFilters(params: URLSearchParams): RideFilters {
  const [departureFrom, departureTo] = readDateRange(params.get('departureFrom'), params.get('departureTo'))
  const status = RIDE_STATUSES.find((s) => s === params.get('status'))
  return { q: readSearch(params), status, departureFrom, departureTo }
}
