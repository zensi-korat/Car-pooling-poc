import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import type { VehicleDocumentType } from '@/features/shared/vehicles/api/vehicleSchema'
import { uploadVehicleDocument } from '../api/vehiclesApi'

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, type, file }: { id: string; type: VehicleDocumentType; file: File }) =>
      uploadVehicleDocument(id, type, file),
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.driver.vehicles }),
  })
}
