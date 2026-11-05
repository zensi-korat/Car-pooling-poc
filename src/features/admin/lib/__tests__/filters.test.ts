import { describe, expect, it } from 'vitest'
import { hasFilters, readAuditLogFilters, readRideFilters, readUserFilters } from '../filters'

const read = (query: string) => readUserFilters(new URLSearchParams(query))

describe('readUserFilters', () => {
  it('reads valid filters', () => {
    expect(read('q=asha&role=DRIVER&joinedFrom=2026-10-01&joinedTo=2026-10-31')).toEqual({
      q: 'asha',
      role: 'DRIVER',
      joinedFrom: '2026-10-01',
      joinedTo: '2026-10-31',
    })
  })

  it('no filters → all undefined', () => {
    expect(read('')).toEqual({ q: undefined, role: undefined, joinedFrom: undefined, joinedTo: undefined })
  })

  it('ignores an unknown role and malformed dates', () => {
    expect(read('role=PILOT&joinedFrom=yesterday&joinedTo=01-10-2026')).toMatchObject({
      role: undefined,
      joinedFrom: undefined,
      joinedTo: undefined,
    })
  })

  it('keeps the search text exactly as typed (spaces too), up to 100 characters', () => {
    expect(read('q=asha%20p').q).toBe('asha p')
    expect(read(`q=${'a'.repeat(150)}`).q).toHaveLength(100)
  })

  it('drops "to" when it is before "from"', () => {
    expect(read('joinedFrom=2026-10-31&joinedTo=2026-10-01')).toMatchObject({
      joinedFrom: '2026-10-31',
      joinedTo: undefined,
    })
  })
})

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

describe('readAuditLogFilters', () => {
  const readLogs = (query: string) => readAuditLogFilters(new URLSearchParams(query))

  it('reads valid filters', () => {
    expect(readLogs('entityType=Ride&action=CANCELLED&from=2026-11-01&to=2026-11-04')).toEqual({
      entityType: 'Ride',
      action: 'CANCELLED',
      from: '2026-11-01',
      to: '2026-11-04',
    })
  })

  it('entity types are case-sensitive, like the server', () => {
    expect(readLogs('entityType=RIDE').entityType).toBeUndefined()
  })

  it('ignores an unknown action and a backwards range', () => {
    expect(readLogs('action=EXPLODED&from=2026-11-04&to=2026-11-01')).toMatchObject({
      action: undefined,
      from: '2026-11-04',
      to: undefined,
    })
  })
})

describe('hasFilters', () => {
  it('false when nothing is set, true when anything is', () => {
    expect(hasFilters({})).toBe(false)
    expect(hasFilters({ role: 'RIDER' })).toBe(true)
    expect(hasFilters({ status: 'CANCELLED' })).toBe(true)
  })
})
