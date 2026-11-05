import { describe, expect, it } from 'vitest'
import { readVehicleFilters } from '../filters'

describe('readVehicleFilters', () => {
  const readVehicles = (query: string) => readVehicleFilters(new URLSearchParams(query))

  it('reads a non-default status', () => {
    expect(readVehicles('status=REJECTED')).toEqual({ status: 'REJECTED' })
  })

  it('PENDING, missing or unknown → undefined (the server defaults to PENDING)', () => {
    expect(readVehicles('status=PENDING')).toEqual({ status: undefined })
    expect(readVehicles('')).toEqual({ status: undefined })
    expect(readVehicles('status=pending')).toEqual({ status: undefined })
  })
})
