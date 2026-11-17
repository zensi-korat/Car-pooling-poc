import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { getDocumentUrl } from '../api/vehiclesApi'
import type { VehicleDocumentType } from '../api/vehicleSchema'

// The signed link works for 60 s: reuse it for 50 s (a margin for slow networks), then the next opening
// fetches a new one. No refetch on window focus: every request is audit-logged.
export function useDocumentUrl(vehicleId: string, type: VehicleDocumentType) {
  return useQuery({
    queryKey: QUERY_KEYS.vehicleDocument(vehicleId, type),
    queryFn: ({ signal }) => getDocumentUrl(vehicleId, type, signal),
    staleTime: 50_000,
    refetchOnWindowFocus: false,
  })
}
