import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { updateRide } from '../api/ridesApi'
import type { RideBody } from '../api/ridesSchema'

export function useUpdateRide() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: RideBody }) => updateRide(id, body),
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.driver.rides }),
  })
}
