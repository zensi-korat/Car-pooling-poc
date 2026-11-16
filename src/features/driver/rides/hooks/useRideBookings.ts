import { useQuery } from '@tanstack/react-query'
import { listRideBookings } from '../api/ridesApi'

// Only fetched while the riders panel is open.
export function useRideBookings(rideId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['driver', 'rides', rideId, 'bookings'],
    queryFn: ({ signal }) => listRideBookings(rideId, signal),
    enabled,
  })
}
