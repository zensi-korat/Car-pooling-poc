import { useMutation } from '@tanstack/react-query'
import type { VehicleDocumentType } from '@/features/shared/vehicles/api/vehicleSchema'
import { getDocumentUrl } from '../api/vehiclesApi'

// A fresh signed link on every click (it expires after 60 s). The server marks it as a download,
// so opening it saves the file and the page stays where it is.
export function useDownloadDocument() {
  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: VehicleDocumentType }) => getDocumentUrl(id, type),
    onSuccess: ({ url }) => window.location.assign(url),
  })
}
