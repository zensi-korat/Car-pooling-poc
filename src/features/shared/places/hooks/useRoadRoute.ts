import { skipToken, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { getRoadRoute } from '../api/placesApi'
import type { RouteEnds } from '../api/placesSchema'

// undefined = no route to draw: skipToken tells TanStack Query not to fetch.
export function useRoadRoute(ends: RouteEnds | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.roadRoute(ends && [ends.originLat, ends.originLng, ends.destLat, ends.destLng]),
    queryFn: ends ? ({ signal }) => getRoadRoute(ends, signal) : skipToken,
    staleTime: Infinity, // roads don't move: the same two ends never need a second request
  })
}
