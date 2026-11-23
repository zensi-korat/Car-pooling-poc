import { MapPinned } from 'lucide-react'
import { useMemo } from 'react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { FitBounds, MapView, PlaceDot, RoutePath } from '@/features/shared/map/components/MapView'
import { straightLine, type LatLng } from '@/features/shared/map/map'
import type { Place } from '@/features/shared/places/api/placesSchema'
import { useRoadRoute } from '@/features/shared/places/hooks/useRoadRoute'

type RoutePreviewMapProps = Readonly<{ origin: Place | null; destination: Place | null }>

export function RoutePreviewMap({ origin, destination }: RoutePreviewMapProps) {
  const ends = useMemo(
    () =>
      origin && destination
        ? { originLat: origin.lat, originLng: origin.lng, destLat: destination.lat, destLng: destination.lng }
        : undefined,
    [origin, destination],
  )
  const road = useRoadRoute(ends)

  // Both places: fit the route. One place: zoom to it.
  const points = useMemo((): LatLng[] => {
    if (ends) return road.data ?? straightLine(ends)
    const place = origin ?? destination
    return place ? [[place.lat, place.lng]] : []
  }, [ends, road.data, origin, destination])

  if (!origin && !destination) {
    return (
      <Empty className="min-h-80 border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MapPinned />
          </EmptyMedia>
          <EmptyTitle>See your route here</EmptyTitle>
          <EmptyDescription>Choose where the ride starts and ends to check the route on the map.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <MapView className="min-h-80">
      {origin && <PlaceDot position={[origin.lat, origin.lng]} label={origin.label} isStart />}
      {destination &&
        (ends ? (
          <RoutePath ends={ends} road={road.data} endLabel={destination.label} />
        ) : (
          <PlaceDot position={[destination.lat, destination.lng]} label={destination.label} />
        ))}
      <FitBounds points={points} />
    </MapView>
  )
}
