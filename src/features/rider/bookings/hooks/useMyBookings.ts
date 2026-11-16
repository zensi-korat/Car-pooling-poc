import { useQuery } from '@tanstack/react-query'
import { listMyBookings } from '../api/bookingsApi'

export function useMyBookings() {
  return useQuery({
    queryKey: ['rider', 'bookings'],
    queryFn: ({ signal }) => listMyBookings(signal),
  })
}
