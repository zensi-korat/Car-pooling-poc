import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { cancelRide } from '../api/ridesApi'

// ['driver', 'rides'] also covers each ride's bookings, which the cancel flips to CANCELLED.
export function useCancelRide() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelRide,
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.driver.rides }),
  })
}
