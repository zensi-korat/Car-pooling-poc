import { describe, expect, it } from 'vitest'
import { hasFilters, readUserFilters } from '../userFilters'

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

describe('hasFilters', () => {
  it('false when nothing is set, true when anything is', () => {
    expect(hasFilters({})).toBe(false)
    expect(hasFilters({ role: 'RIDER' })).toBe(true)
  })
})
