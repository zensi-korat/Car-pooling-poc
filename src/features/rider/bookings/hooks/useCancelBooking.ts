import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelBooking } from '@/features/shared/bookings/api/bookingsApi'

export function useCancelBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelBooking,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['rider', 'bookings'] }),
  })
}
