import { divIcon } from 'leaflet'
import { useMemo } from 'react'
import { Marker } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { FitBounds, MapView, RoutePath } from '@/features/shared/map/components/MapView'
import { straightLine, type LatLng } from '@/features/shared/map/map'
import { useRoadRoute } from '@/features/shared/places/hooks/useRoadRoute'
import type { Ride } from '@/features/shared/rides/api/rideSchema'
import { formatFare } from '@/lib/format'
import { cn } from '@/lib/utils'

const BUBBLE_CLASSES =
  'absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-2.5 py-1 font-sans text-sm font-semibold tabular-nums shadow-md'

// A 0×0 icon sitting exactly on the point; the bubble inside is centred on it.
// `html` is raw HTML: only put our own formatted values in it, never text people typed.
function bubbleIcon(text: string, isSelected = false) {
  const colours = isSelected ? 'border-primary bg-primary text-primary-foreground' : 'bg-background text-foreground'
  return divIcon({
    className: '',
    iconSize: [0, 0],
    html: `<span class="${cn(BUBBLE_CLASSES, colours)}">${text}</span>`,
  })
}

// The bubble that stands in for nearby rides when the map is zoomed out.
function clusterIcon(cluster: Readonly<{ getChildCount: () => number }>) {
  return bubbleIcon(`${cluster.getChildCount()} rides`)
}

type RidesMapProps = Readonly<{ rides: Ride[]; selectedRide: Ride | undefined; onSelect: (id: string) => void }>

export function RidesMap({ rides, selectedRide, onSelect }: RidesMapProps) {
  const roadRoute = useRoadRoute(selectedRide)

  // A picked ride: fit its route. Otherwise: fit every ride's start.
  const points = useMemo(
    (): LatLng[] =>
      selectedRide
        ? (roadRoute.data ?? straightLine(selectedRide))
        : rides.map((ride) => [ride.originLat, ride.originLng]),
    [rides, selectedRide, roadRoute.data],
  )

  return (
    <MapView className="h-96 lg:sticky lg:top-6 lg:h-[calc(100svh-3rem)]">
      <MarkerClusterGroup iconCreateFunction={clusterIcon} showCoverageOnHover={false}>
        {rides
          .filter((ride) => ride.id !== selectedRide?.id)
          .map((ride) => (
            <RideMarker key={ride.id} ride={ride} isSelected={false} onSelect={onSelect} />
          ))}
      </MarkerClusterGroup>

      {/* Outside the cluster group, so the selected ride never hides inside a "3 rides" bubble. */}
      {selectedRide && (
        <>
          <RideMarker ride={selectedRide} isSelected onSelect={onSelect} />
          <RoutePath ends={selectedRide} road={roadRoute.data} endLabel={selectedRide.destLabel} />
        </>
      )}

      <FitBounds points={points} />
    </MapView>
  )
}

type RideMarkerProps = Readonly<{ ride: Ride; isSelected: boolean; onSelect: (id: string) => void }>

function RideMarker({ ride, isSelected, onSelect }: RideMarkerProps) {
  return (
    <Marker
      position={[ride.originLat, ride.originLng]}
      icon={bubbleIcon(formatFare(ride.estimatedCost), isSelected)}
      zIndexOffset={isSelected ? 1000 : 0}
      title={`${ride.originLabel} → ${ride.destLabel}`}
      eventHandlers={{ click: () => onSelect(ride.id) }}
    />
  )
}
