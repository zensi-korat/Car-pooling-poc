import axios from 'axios'
import { z } from 'zod'
import { env } from '@/config/env'
import {
  locationIqErrorSchema,
  placeSchema,
  roadRouteSchema,
  type Place,
  type RoadRoute,
  type RouteEnds,
} from './placesSchema'

const placesSchema = z.array(placeSchema)

// LocationIQ, not our backend, so plain axios instead of api(): api() sends our cookies (LocationIQ's
// CORS answer `*` forbids them) and would treat LocationIQ's 401 as our session expiring.
// GET /v1/autocomplete → up to 5 places in India. 404 "Unable to geocode" = no match. 401 "Invalid key".
export async function searchPlaces(text: string, signal?: AbortSignal): Promise<Place[]> {
  try {
    const { data } = await axios.get('https://api.locationiq.com/v1/autocomplete', {
      params: { key: env.locationIqKey, q: text, countrycodes: 'in', limit: 5, dedupe: 1 },
      signal,
    })
    return placesSchema.parse(data)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 404) return []
      const body = locationIqErrorSchema.safeParse(error.response.data)
      if (body.success) throw new Error(body.data.error)
    }
    throw error
  }
}

// GET /v1/directions/driving/{lng,lat;lng,lat} → the road line between the two ends (longitude first).
export async function getRoadRoute(ends: RouteEnds, signal?: AbortSignal): Promise<RoadRoute> {
  const coordinates = `${ends.originLng},${ends.originLat};${ends.destLng},${ends.destLat}`
  const { data } = await axios.get(`https://us1.locationiq.com/v1/directions/driving/${coordinates}`, {
    params: { key: env.locationIqKey, overview: 'full', geometries: 'geojson' },
    signal,
  })
  return roadRouteSchema.parse(data)
}
