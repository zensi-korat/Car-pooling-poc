import type { Ride, RideStatus } from '@/features/shared/rides/api/rideSchema'
import type { Vehicle } from '@/features/shared/vehicles/api/vehicleSchema'
import { isBeforeDepartureDay, toDateTimeText } from '@/lib/dates'
import type { RideBody, RideFormValues } from '../api/ridesSchema'

type RideActions = { canEdit: boolean; canCancel: boolean; canComplete: boolean }

// The server's rules: edit only before departure and while nobody has booked a seat, cancel only before
// the departure day starts (IST), complete only once departed.
export function getRideActions(ride: Ride, now: Date): RideActions {
  if (ride.status !== 'SCHEDULED') return { canEdit: false, canCancel: false, canComplete: false }
  const departed = now >= new Date(ride.departureTime)
  return {
    canEdit: !departed && ride.seatsAvailable === ride.totalSeats,
    canCancel: isBeforeDepartureDay(ride.departureTime, now),
    canComplete: departed,
  }
}

// Upcoming rides soonest first (the ones waiting to be completed come on top), past ones newest first.
export function ridesForTab(rides: Ride[], status: RideStatus): Ride[] {
  const direction = status === 'SCHEDULED' ? 1 : -1
  return rides
    .filter((ride) => ride.status === status)
    .sort((a, b) => direction * a.departureTime.localeCompare(b.departureTime))
}

// A ride → the form's starting values, for editing.
export function toRideFormValues(ride: Ride, vehicles: Vehicle[]): RideFormValues {
  return {
    origin: { id: `${ride.id}-origin`, label: ride.originLabel, address: '', lat: ride.originLat, lng: ride.originLng },
    destination: { id: `${ride.id}-dest`, label: ride.destLabel, address: '', lat: ride.destLat, lng: ride.destLng },
    departureTime: toDateTimeText(new Date(ride.departureTime)),
    estimatedCost: ride.estimatedCost,
    // A ride carries only a snapshot of its vehicle (no id), so find the vehicle by its plate.
    vehicleId: vehicles.find((vehicle) => vehicle.plateNumber === ride.vehicle?.plate)?.id ?? '',
  }
}

// Form values → the POST / PATCH body. Call it only after the form passed rideFormSchema.
// departureTime is the browser's local time ("2026-11-20T09:30").
export function toRideBody(values: RideFormValues): RideBody {
  const { origin, destination } = values
  if (!origin || !destination) throw new Error('Both places are required')
  return {
    originLabel: origin.label,
    originLat: origin.lat,
    originLng: origin.lng,
    destLabel: destination.label,
    destLat: destination.lat,
    destLng: destination.lng,
    departureTime: new Date(values.departureTime).toISOString(),
    estimatedCost: Number(values.estimatedCost).toFixed(2),
    vehicleId: values.vehicleId,
  }
}
