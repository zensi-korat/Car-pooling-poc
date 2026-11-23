import type { RouteEnds } from '@/features/shared/places/api/placesSchema'

// A point in Leaflet's order: [latitude, longitude].
export type LatLng = [number, number]

export function straightLine(ends: RouteEnds): LatLng[] {
  return [
    [ends.originLat, ends.originLng],
    [ends.destLat, ends.destLng],
  ]
}
