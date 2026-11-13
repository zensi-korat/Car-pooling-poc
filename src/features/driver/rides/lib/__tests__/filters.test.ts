import { describe, expect, it } from 'vitest'
import { readMyRideFilters } from '../filters'

const read = (query: string) => readMyRideFilters(new URLSearchParams(query))

describe('readMyRideFilters', () => {
  it('reads a known tab', () => {
    expect(read('status=CANCELLED')).toEqual({ status: 'CANCELLED' })
  })

  it('ignores the default tab and unknown values', () => {
    expect(read('status=SCHEDULED')).toEqual({ status: undefined })
    expect(read('status=nope')).toEqual({ status: undefined })
    expect(read('')).toEqual({ status: undefined })
  })
})
