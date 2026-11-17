import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { listRides } from '../api/ridesApi'
import type { ListRidesParams } from '../api/ridesSchema'

// One page of rides for the admin table. Same caching rules as useAdminUsers.
export function useAdminRides(params: ListRidesParams) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.rides(params),
    queryFn: ({ signal }) => listRides(params, signal),
    placeholderData: keepPreviousData,
  })
}
