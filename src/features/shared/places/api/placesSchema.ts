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

// GET /v1/directions/driving → the best route's road line. GeoJSON points arrive as [lng, lat]; Leaflet wants [lat, lng].
export const roadRouteSchema = z
  .object({
    routes: z
      .array(z.object({ geometry: z.object({ coordinates: z.array(z.tuple([z.number(), z.number()])) }) }))
      .min(1),
  })
  .transform(({ routes }) => routes[0].geometry.coordinates.map(([lng, lat]): [number, number] => [lat, lng]))
export type RoadRoute = z.infer<typeof roadRouteSchema>

// The two ends of a route. A Ride fits this shape, so a ride can be passed as it is.
export type RouteEnds = { originLat: number; originLng: number; destLat: number; destLng: number }
