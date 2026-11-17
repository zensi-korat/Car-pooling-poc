import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { updateVehicle } from '../api/vehiclesApi'
import type { UpdateVehicleBody } from '../api/vehiclesSchema'

export function useUpdateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateVehicleBody }) => updateVehicle(id, body),
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.driver.vehicles }),
  })
}
