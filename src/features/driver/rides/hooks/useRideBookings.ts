import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { listRideBookings } from '../api/ridesApi'

// Only fetched while the riders panel is open.
export function useRideBookings(rideId: string, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.driver.rideBookings(rideId),
    queryFn: ({ signal }) => listRideBookings(rideId, signal),
    enabled,
  })
}
