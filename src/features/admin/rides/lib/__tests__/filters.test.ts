import { describe, expect, it } from 'vitest'
import { readRideFilters } from '../filters'

describe('readRideFilters', () => {
  const readRides = (query: string) => readRideFilters(new URLSearchParams(query))

  it('reads valid filters', () => {
    expect(readRides('q=pune&status=SCHEDULED&departureFrom=2026-11-01&departureTo=2026-11-30')).toEqual({
      q: 'pune',
      status: 'SCHEDULED',
      departureFrom: '2026-11-01',
      departureTo: '2026-11-30',
    })
  })

  it('ignores an unknown status and malformed dates', () => {
    expect(readRides('status=scheduled&departureFrom=tomorrow')).toMatchObject({
      status: undefined,
      departureFrom: undefined,
    })
  })

  it('drops "to" when it is before "from"', () => {
    expect(readRides('departureFrom=2026-11-30&departureTo=2026-11-01')).toMatchObject({
      departureFrom: '2026-11-30',
      departureTo: undefined,
    })
  })

  it('does not read the users filters', () => {
    expect(readRides('role=DRIVER&joinedFrom=2026-10-01')).toEqual({
      q: undefined,
      status: undefined,
      departureFrom: undefined,
      departureTo: undefined,
    })
  })
})
