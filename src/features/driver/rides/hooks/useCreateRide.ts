import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { createRide } from '../api/ridesApi'

export function useCreateRide() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createRide,
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.driver.rides }),
  })
}
