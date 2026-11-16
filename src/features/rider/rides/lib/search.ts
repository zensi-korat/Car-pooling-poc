import { fromDateText } from '@/lib/dates'
import type { SearchFormValues, SearchRidesParams } from '../api/ridesSchema'

// Form values → search params. Call it only after the form passed searchFormSchema.
// The day range becomes a time window: the first day's start to the last day's end (the browser's clock).
export function toSearchParams({ origin, destination, dates }: SearchFormValues): SearchRidesParams {
  if (!origin || !destination) throw new Error('Both places are required')
  const params: SearchRidesParams = {
    originLat: origin.lat,
    originLng: origin.lng,
    destLat: destination.lat,
    destLng: destination.lng,
  }
  if (dates.from) params.earliestDeparture = fromDateText(dates.from).toISOString()
  if (dates.to) {
    const end = fromDateText(dates.to)
    end.setHours(23, 59, 59, 999)
    params.latestDeparture = end.toISOString()
  }
  return params
}
