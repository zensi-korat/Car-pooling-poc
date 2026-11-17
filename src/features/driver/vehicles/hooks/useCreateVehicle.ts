import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { createVehicle } from '../api/vehiclesApi'

export function useCreateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createVehicle,
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.driver.vehicles }),
  })
}
