import { describe, expect, it } from 'vitest'
import { formatDateTime, formatDay, formatFare, formatTime } from '../format'

describe('formatDateTime', () => {
  it('shows the time in India, not UTC', () => {
    expect(formatDateTime('2026-11-12T04:00:00.000Z')).toBe('12 Nov 2026, 9:30 am')
  })
})

describe('formatTime', () => {
  it('shows only the India time', () => {
    expect(formatTime('2026-11-12T04:00:00.000Z')).toBe('9:30 am')
  })
})

describe('formatDay', () => {
  it('uses the India date, which can differ from UTC', () => {
    expect(formatDay('2026-11-12T20:00:00.000Z')).toBe('Fri, 13 Nov')
  })
})

describe('formatFare', () => {
  it('drops .00 and groups digits the Indian way', () => {
    expect(formatFare('120000.00')).toBe('₹1,20,000')
  })

  it('keeps paise when there are some', () => {
    expect(formatFare('412.50')).toBe('₹412.50')
  })
})
