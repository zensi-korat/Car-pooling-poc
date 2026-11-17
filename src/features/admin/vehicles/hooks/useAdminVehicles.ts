import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { listVehicles } from '../api/vehiclesApi'
import type { ListVehiclesParams } from '../api/vehiclesSchema'

// One page of the vehicle review queue. Same caching rules as useAdminUsers.
export function useAdminVehicles(params: ListVehiclesParams) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.vehicles(params),
    queryFn: ({ signal }) => listVehicles(params, signal),
    placeholderData: keepPreviousData,
  })
}
