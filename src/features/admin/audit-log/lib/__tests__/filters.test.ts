import { describe, expect, it } from 'vitest'
import { readAuditLogFilters } from '../filters'

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
