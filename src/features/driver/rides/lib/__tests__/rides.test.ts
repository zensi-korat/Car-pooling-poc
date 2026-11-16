import { describe, expect, it } from 'vitest'
import type { Ride } from '@/features/shared/rides/api/rideSchema'
import type { Vehicle } from '@/features/shared/vehicles/api/vehicleSchema'
import { toDateTimeText } from '@/lib/dates'
import { getRideActions, ridesForTab, toRideBody, toRideFormValues } from '../rides'

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
  it('allows edit and cancel (not complete) on an earlier day', () => {
    expect(getRideActions(ride({}), new Date('2026-11-19T12:00:00.000Z'))).toEqual({
      canEdit: true,
      canCancel: true,
      canComplete: false,
    })
  })

  it('blocks editing once someone has booked a seat', () => {
    expect(getRideActions(ride({ seatsAvailable: 3 }), new Date('2026-11-19T12:00:00.000Z')).canEdit).toBe(false)
  })

  it('allows only editing once the departure day has started in India, before departure', () => {
    // 19 Nov 18:30 UTC = 20 Nov 00:00 IST
    expect(getRideActions(ride({}), new Date('2026-11-19T18:30:00.000Z'))).toEqual({
      canEdit: true,
      canCancel: false,
      canComplete: false,
    })
  })

  it('allows only complete once departed', () => {
    expect(getRideActions(ride({}), new Date('2026-11-20T04:00:00.000Z'))).toEqual({
      canEdit: false,
      canCancel: false,
      canComplete: true,
    })
  })

  it('allows nothing on a ride that is already closed', () => {
    const early = new Date('2026-11-01T00:00:00.000Z')
    const nothing = { canEdit: false, canCancel: false, canComplete: false }
    expect(getRideActions(ride({ status: 'CANCELLED' }), early)).toEqual(nothing)
    expect(getRideActions(ride({ status: 'COMPLETED' }), early)).toEqual(nothing)
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

describe('toRideBody', () => {
  const values = {
    origin: { id: 'a', label: 'Kalupur Railway Station', address: 'Ahmedabad', lat: 23.0247, lng: 72.6031 },
    destination: { id: 'b', label: 'Iskcon Cross Roads', address: 'Ahmedabad', lat: 23.0273, lng: 72.5075 },
    departureTime: '2026-11-20T09:30',
    estimatedCost: ' 1200 ',
    vehicleId: 'v1',
  }

  it('spreads the places into label + lat + lng, and writes the fare with two decimals', () => {
    expect(toRideBody(values)).toEqual({
      originLabel: 'Kalupur Railway Station',
      originLat: 23.0247,
      originLng: 72.6031,
      destLabel: 'Iskcon Cross Roads',
      destLat: 23.0273,
      destLng: 72.5075,
      departureTime: new Date('2026-11-20T09:30').toISOString(),
      estimatedCost: '1200.00',
      vehicleId: 'v1',
    })
  })

  it('keeps paise', () => {
    expect(toRideBody({ ...values, estimatedCost: '1200.5' }).estimatedCost).toBe('1200.50')
  })
})

describe('toRideFormValues', () => {
  const swift: Vehicle = {
    id: 'v1',
    make: 'Maruti',
    model: 'Swift',
    colour: 'White',
    plateNumber: 'GJ01AB1234',
    seatCapacity: 4,
    status: 'APPROVED',
    rejectionNote: null,
    reviewedAt: null,
    createdAt: '2026-11-01T00:00:00.000Z',
    documents: [],
  }
  const withSwift = ride({ vehicle: { make: 'Maruti', model: 'Swift', colour: 'White', plate: 'GJ01AB1234' } })

  it('fills the form from the ride, finding the vehicle by its plate', () => {
    expect(toRideFormValues(withSwift, [swift])).toEqual({
      origin: { id: '1-origin', label: 'Ahmedabad', address: '', lat: 23.02, lng: 72.57 },
      destination: { id: '1-dest', label: 'Mumbai', address: '', lat: 19.07, lng: 72.87 },
      departureTime: toDateTimeText(new Date('2026-11-20T04:00:00.000Z')),
      estimatedCost: '1200.00',
      vehicleId: 'v1',
    })
  })

  it('leaves the vehicle empty when no vehicle has that plate', () => {
    expect(toRideFormValues(withSwift, [{ ...swift, plateNumber: 'MH12XY9999' }]).vehicleId).toBe('')
  })

  it('turns back into the same body it came from', () => {
    const body = toRideBody(toRideFormValues(withSwift, [swift]))
    expect(body.departureTime).toBe('2026-11-20T04:00:00.000Z')
    expect([body.originLat, body.destLng, body.estimatedCost]).toEqual([23.02, 72.87, '1200.00'])
  })
})
