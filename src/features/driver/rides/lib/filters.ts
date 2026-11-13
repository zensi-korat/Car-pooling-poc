import { rideStatusSchema, type RideStatus } from '@/features/shared/rides/api/rideSchema'

export const DEFAULT_TAB: RideStatus = 'SCHEDULED'

// ?status=COMPLETED → that tab. The default tab stays out of the URL; anything unknown is ignored.
export function readMyRideFilters(params: URLSearchParams): { status?: RideStatus } {
  return { status: rideStatusSchema.options.find((s) => s === params.get('status') && s !== DEFAULT_TAB) }
}
