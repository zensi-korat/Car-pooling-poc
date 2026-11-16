import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bookSeat } from '../api/ridesApi'

// ['rider'] covers both the search results (one seat fewer) and My Bookings (the new booking).
export function useBookSeat() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bookSeat,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['rider'] }),
  })
}
