import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { searchRides } from '../api/ridesApi'
import type { SearchRidesParams } from '../api/ridesSchema'

// null = the rider hasn't searched yet: skipToken tells TanStack Query not to fetch.
export function useSearchRides(params: SearchRidesParams | null) {
  return useQuery({
    queryKey: QUERY_KEYS.rider.searchRides(params),
    queryFn: params ? ({ signal }) => searchRides(params, signal) : skipToken,
    placeholderData: keepPreviousData,
  })
}
