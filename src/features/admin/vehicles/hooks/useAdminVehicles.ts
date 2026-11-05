import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listVehicles } from '../api/vehiclesApi'
import type { ListVehiclesParams } from '../api/vehiclesSchema'

// One page of the vehicle review queue. Same caching rules as useAdminUsers.
export function useAdminVehicles(params: ListVehiclesParams) {
  return useQuery({
    queryKey: ['admin', 'vehicles', params],
    queryFn: ({ signal }) => listVehicles(params, signal),
    placeholderData: keepPreviousData,
  })
}
