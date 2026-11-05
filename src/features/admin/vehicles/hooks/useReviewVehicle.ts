import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewVehicle } from '../api/vehiclesApi'
import type { ReviewVehicleBody } from '../api/vehiclesSchema'

// Approve or reject a vehicle. Afterwards (success or error) every admin list is marked stale,
// so the queue reloads: a reviewed vehicle leaves "Pending", and a 409 shows the latest state.
export function useReviewVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...body }: ReviewVehicleBody & { id: string }) => reviewVehicle(id, body),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  })
}
