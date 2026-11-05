import { describe, expect, it } from 'vitest'
import { hasFilters } from '../filters'

describe('hasFilters', () => {
  it('false when nothing is set, true when anything is', () => {
    expect(hasFilters({})).toBe(false)
    expect(hasFilters({ role: 'RIDER' })).toBe(true)
    expect(hasFilters({ status: 'CANCELLED' })).toBe(true)
  })
})
