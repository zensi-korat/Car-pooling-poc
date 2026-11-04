import { describe, expect, it } from 'vitest'
import { fromDateText, toDateText } from '../dates'

describe('toDateText', () => {
  it('pads month and day', () => {
    expect(toDateText(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('uses the local day, even at midnight', () => {
    expect(toDateText(new Date(2026, 9, 2, 0, 0))).toBe('2026-10-02')
  })
})

describe('fromDateText', () => {
  it('gives local midnight of that day', () => {
    const date = fromDateText('2026-10-02')
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2026, 9, 2, 0])
  })

  it('round-trips', () => {
    expect(toDateText(fromDateText('2026-12-31'))).toBe('2026-12-31')
  })
})
