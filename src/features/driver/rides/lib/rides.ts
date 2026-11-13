import type { Ride, RideStatus } from '@/features/shared/rides/api/rideSchema'
import { isBeforeDepartureDay } from '@/lib/dates'

// The server's rules: cancel only before the departure day starts (IST), complete only once departed.
export function getRideActions(ride: Ride, now: Date): { canCancel: boolean; canComplete: boolean } {
  if (ride.status !== 'SCHEDULED') return { canCancel: false, canComplete: false }
  return {
    canCancel: isBeforeDepartureDay(ride.departureTime, now),
    canComplete: now >= new Date(ride.departureTime),
  }
}

// Upcoming rides soonest first (the ones waiting to be completed come on top), past ones newest first.
export function ridesForTab(rides: Ride[], status: RideStatus): Ride[] {
  const direction = status === 'SCHEDULED' ? 1 : -1
  return rides
    .filter((ride) => ride.status === status)
    .sort((a, b) => direction * a.departureTime.localeCompare(b.departureTime))
}
