import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { completeRide } from '../api/ridesApi'

export function useCompleteRide() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: completeRide,
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.driver.rides }),
  })
}
