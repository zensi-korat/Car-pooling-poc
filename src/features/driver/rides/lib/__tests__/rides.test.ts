import { describe, expect, it } from 'vitest'
import type { Ride } from '@/features/shared/rides/api/rideSchema'
import { getRideActions, ridesForTab } from '../rides'

function ride(overrides: Partial<Ride>): Ride {
  return {
    id: '1',
    driverId: 'd1',
    originLabel: 'Ahmedabad',
    originLat: 23.02,
    originLng: 72.57,
    destLabel: 'Mumbai',
    destLat: 19.07,
    destLng: 72.87,
    departureTime: '2026-11-20T04:00:00.000Z', // 20 Nov, 9:30 am IST
    totalSeats: 4,
    seatsAvailable: 4,
    estimatedCost: '1200.00',
    status: 'SCHEDULED',
    vehicle: null,
    ...overrides,
  }
}

describe('getRideActions', () => {
  it('allows cancel (not complete) on an earlier day', () => {
    expect(getRideActions(ride({}), new Date('2026-11-19T12:00:00.000Z'))).toEqual({
      canCancel: true,
      canComplete: false,
    })
  })

  it('allows neither once the departure day has started in India, before departure', () => {
    // 19 Nov 18:30 UTC = 20 Nov 00:00 IST
    expect(getRideActions(ride({}), new Date('2026-11-19T18:30:00.000Z'))).toEqual({
      canCancel: false,
      canComplete: false,
    })
  })

  it('allows complete (not cancel) once departed', () => {
    expect(getRideActions(ride({}), new Date('2026-11-20T04:00:00.000Z'))).toEqual({
      canCancel: false,
      canComplete: true,
    })
  })

  it('allows nothing on a ride that is already closed', () => {
    const early = new Date('2026-11-01T00:00:00.000Z')
    expect(getRideActions(ride({ status: 'CANCELLED' }), early)).toEqual({ canCancel: false, canComplete: false })
    expect(getRideActions(ride({ status: 'COMPLETED' }), early)).toEqual({ canCancel: false, canComplete: false })
  })
})

describe('ridesForTab', () => {
  const rides = [
    ride({ id: 'late', departureTime: '2026-12-01T04:00:00.000Z' }),
    ride({ id: 'done', status: 'COMPLETED', departureTime: '2026-11-01T04:00:00.000Z' }),
    ride({ id: 'soon', departureTime: '2026-11-15T04:00:00.000Z' }),
    ride({ id: 'done-later', status: 'COMPLETED', departureTime: '2026-11-05T04:00:00.000Z' }),
  ]

  it('keeps one status and lists upcoming rides soonest first', () => {
    expect(ridesForTab(rides, 'SCHEDULED').map((r) => r.id)).toEqual(['soon', 'late'])
  })

  it('lists past rides newest first', () => {
    expect(ridesForTab(rides, 'COMPLETED').map((r) => r.id)).toEqual(['done-later', 'done'])
  })
})
