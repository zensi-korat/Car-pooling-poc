import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { searchPlaces } from '../api/placesApi'

export const MIN_SEARCH_LENGTH = 3

// Searches only once typing pauses, keeping us inside LocationIQ's free 2 requests/second.
export function usePlaceSuggestions(text: string) {
  const query = useDebouncedValue(text.trim())

  return useQuery({
    queryKey: QUERY_KEYS.places(query),
    queryFn: ({ signal }) => searchPlaces(query, signal),
    enabled: query.length >= MIN_SEARCH_LENGTH,
    placeholderData: keepPreviousData,
    staleTime: Infinity, // places don't move: the same text never needs a second request
  })
}
