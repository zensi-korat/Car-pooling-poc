import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelBooking } from '@/features/shared/bookings/api/bookingsApi'

// ['driver', 'rides'] covers the ride's bookings list and the seat count on its card.
export function useCancelRideBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelBooking,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['driver', 'rides'] }),
  })
}
