import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createRide } from '../api/ridesApi'

export function useCreateRide() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createRide,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['driver', 'rides'] }),
  })
}
