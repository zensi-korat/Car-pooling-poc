import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { listMyBookings } from '../api/bookingsApi'

export function useMyBookings() {
  return useQuery({
    queryKey: QUERY_KEYS.rider.bookings,
    queryFn: ({ signal }) => listMyBookings(signal),
  })
}
