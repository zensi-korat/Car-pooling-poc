import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { bookSeat } from '../api/ridesApi'

// QUERY_KEYS.rider.all covers both the search results (one seat fewer) and My Bookings (the new booking).
export function useBookSeat() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bookSeat,
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rider.all }),
  })
}
