import { describe, expect, it } from 'vitest'
import { fromDateText, isBeforeDepartureDay, toDateText } from '../dates'

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

describe('isBeforeDepartureDay', () => {
  const departure = '2026-11-20T04:00:00.000Z' // 20 Nov, 9:30 am IST

  it('is true on an earlier day in India', () => {
    expect(isBeforeDepartureDay(departure, new Date('2026-11-19T18:29:00.000Z'))).toBe(true) // 19 Nov, 11:59 pm IST
  })

  it('is false from midnight of the departure day in India, even if UTC is still the day before', () => {
    expect(isBeforeDepartureDay(departure, new Date('2026-11-19T18:30:00.000Z'))).toBe(false) // 20 Nov, 00:00 IST
  })
})
