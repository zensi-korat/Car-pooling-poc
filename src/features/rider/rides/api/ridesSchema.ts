import { z } from 'zod'
import type { DateTextRange } from '@/components/DateRangeFilter'
import type { Place } from '@/features/shared/places/api/placesSchema'

// The Find a ride form. Dates are optional: without them the server returns every upcoming ride on the route.
export const searchFormSchema = z
  .object({
    origin: z.custom<Place | null>((place) => place !== null, 'Choose where you start'),
    destination: z.custom<Place | null>((place) => place !== null, 'Choose where you are going'),
    dates: z.custom<DateTextRange>(),
  })
  .refine(
    ({ origin, destination }) =>
      !origin || !destination || origin.lat !== destination.lat || origin.lng !== destination.lng,
    { message: 'Pick a different place than the start', path: ['destination'] },
  )
export type SearchFormValues = z.infer<typeof searchFormSchema>

// GET /api/rides/search query params. radiusKm is left out: the server's 10 km default is fine.
export type SearchRidesParams = {
  originLat: number
  originLng: number
  destLat: number
  destLng: number
  earliestDeparture?: string // ISO date-time
  latestDeparture?: string // ISO date-time
}
