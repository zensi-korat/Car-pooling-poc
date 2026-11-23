import { useEffect, type ReactNode } from 'react'
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { env } from '@/config/env'
import type { RouteEnds } from '@/features/shared/places/api/placesSchema'
import { cn } from '@/lib/utils'
import { selectResolvedTheme, useThemeStore } from '@/stores/themeStore'
import { straightLine, type LatLng } from '../map'

const INDIA_CENTER: LatLng = [22.5, 78.9]
const TILE_URLS: Record<'light' | 'dark', string> = {
  light: `https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${env.locationIqKey}`,
  dark: `https://{s}-tiles.locationiq.com/v3/dark/r/{z}/{x}/{y}.png?key=${env.locationIqKey}`,
}
const ATTRIBUTION =
  '&copy; <a href="https://locationiq.com">LocationIQ</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
const ROAD_STYLE = { className: 'stroke-primary', weight: 4 }
const STRAIGHT_STYLE = { className: 'stroke-primary', weight: 3, dashArray: '6 8' }
const START_STYLE = { className: 'fill-background stroke-primary', fillOpacity: 1, weight: 3 }
const END_STYLE = { className: 'fill-primary stroke-background', fillOpacity: 1, weight: 2 }

type MapViewProps = Readonly<{ className?: string; children: ReactNode }>

// The map box with LocationIQ pictures in the app's theme. Give it a height through `className`.
export function MapView({ className, children }: MapViewProps) {
  const theme = useThemeStore(selectResolvedTheme)

  return (
    // `isolate` keeps Leaflet's high z-indexes inside the map, so it can't cover dropdowns and dialogs.
    <MapContainer center={INDIA_CENTER} zoom={5} className={cn('isolate rounded-xl border', className)}>
      <TileLayer url={TILE_URLS[theme]} attribution={ATTRIBUTION} />
      {children}
    </MapContainer>
  )
}

// MapContainer reads `center` only once, so later moves go through Leaflet's own map object.
// Keep `points` the same array until they really change (useMemo): a new array moves the map again.
export function FitBounds({ points }: Readonly<{ points: LatLng[] }>) {
  const map = useMap()

  useEffect(() => {
    if (points.length > 0) map.fitBounds(points, { padding: [48, 48], maxZoom: 14 })
  }, [map, points])

  return null
}

type RoutePathProps = Readonly<{ ends: RouteEnds; road: LatLng[] | undefined; endLabel: string }>

// The road once LocationIQ answers; a dashed straight line until then (or if it fails).
export function RoutePath({ ends, road, endLabel }: RoutePathProps) {
  return (
    <>
      {/* New key = a fresh line: Leaflet's setStyle merges styles, so the old dashes would stay on the road. */}
      <Polyline
        key={road ? 'road' : 'straight'}
        positions={road ?? straightLine(ends)}
        pathOptions={road ? ROAD_STYLE : STRAIGHT_STYLE}
      />
      <PlaceDot position={[ends.destLat, ends.destLng]} label={endLabel} />
    </>
  )
}

type PlaceDotProps = Readonly<{ position: LatLng; label: string; isStart?: boolean }>

export function PlaceDot({ position, label, isStart = false }: PlaceDotProps) {
  return (
    <CircleMarker center={position} radius={7} pathOptions={isStart ? START_STYLE : END_STYLE}>
      <Tooltip permanent direction="top" offset={[0, -8]}>
        {label}
      </Tooltip>
    </CircleMarker>
  )
}
