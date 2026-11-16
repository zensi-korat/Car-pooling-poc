import { describe, expect, it } from 'vitest'
import { formatDayText, fromDateText, isBeforeDepartureDay, toDateText, toDateTimeText, toIstDayText } from '../dates'

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

describe('formatDayText', () => {
  it('writes the day for people', () => {
    expect(formatDayText('2026-11-20')).toBe('20 Nov 2026')
  })
})

describe('toDateTimeText', () => {
  it('writes the local day and time, padded', () => {
    expect(toDateTimeText(new Date(2026, 10, 20, 9, 5))).toBe('2026-11-20T09:05')
  })

  it('round-trips through new Date()', () => {
    const moment = new Date(2026, 10, 20, 21, 30)
    expect(new Date(toDateTimeText(moment)).getTime()).toBe(moment.getTime())
  })
})

describe('toIstDayText', () => {
  it('gives the day in India, which can be a day ahead of UTC', () => {
    expect(toIstDayText('2026-11-19T18:29:00.000Z')).toBe('2026-11-19') // 11:59 pm IST
    expect(toIstDayText('2026-11-19T18:30:00.000Z')).toBe('2026-11-20') // midnight IST
  })
})
