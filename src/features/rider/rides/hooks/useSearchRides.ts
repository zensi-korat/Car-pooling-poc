import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import { searchRides } from '../api/ridesApi'
import type { SearchRidesParams } from '../api/ridesSchema'

// null = the rider hasn't searched yet: skipToken tells TanStack Query not to fetch.
export function useSearchRides(params: SearchRidesParams | null) {
  return useQuery({
    queryKey: ['rider', 'rides', 'search', params],
    queryFn: params ? ({ signal }) => searchRides(params, signal) : skipToken,
    placeholderData: keepPreviousData,
  })
}
