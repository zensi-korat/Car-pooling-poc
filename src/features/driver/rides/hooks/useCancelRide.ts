import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelRide } from '../api/ridesApi'

// ['driver', 'rides'] also covers each ride's bookings, which the cancel flips to CANCELLED.
export function useCancelRide() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelRide,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['driver', 'rides'] }),
  })
}
