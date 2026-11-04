import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listRides } from '../api/adminApi'
import type { ListRidesParams } from '../types'

// One page of rides for the admin table. Same caching rules as useAdminUsers.
export function useAdminRides(params: ListRidesParams) {
  return useQuery({
    queryKey: ['admin', 'rides', params],
    queryFn: ({ signal }) => listRides(params, signal),
    placeholderData: keepPreviousData,
  })
}
