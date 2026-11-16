import { z } from 'zod'

// One LocationIQ autocomplete suggestion, checked against a real response, renamed to the words our backend uses.
// lat/lon arrive as text ("23.0246913").
export const placeSchema = z
  .object({
    place_id: z.string(),
    display_place: z.string(), // "Kalupur Railway Station"
    display_address: z.string(), // "Sarangpur, Maninagar Taluka, Gujarat, 380021, India"
    lat: z.coerce.number(),
    lon: z.coerce.number(),
  })
  .transform((place) => ({
    id: place.place_id,
    label: place.display_place,
    address: place.display_address,
    lat: place.lat,
    lng: place.lon,
  }))
export type Place = z.infer<typeof placeSchema>

export const locationIqErrorSchema = z.object({ error: z.string() })
