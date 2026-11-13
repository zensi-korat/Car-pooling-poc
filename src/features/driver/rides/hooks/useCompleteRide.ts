import { useMutation, useQueryClient } from '@tanstack/react-query'
import { completeRide } from '../api/ridesApi'

export function useCompleteRide() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: completeRide,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['driver', 'rides'] }),
  })
}
