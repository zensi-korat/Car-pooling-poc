import { describe, expect, it } from 'vitest'
import { humanize, initials } from '../text'

describe('humanize', () => {
  it('turns UPPER_SNAKE codes into a sentence', () => {
    expect(humanize('EXPIRED_NO_BOOKINGS')).toBe('Expired no bookings')
    expect(humanize('CANCELLED')).toBe('Cancelled')
  })

  it('splits camelCase keys', () => {
    expect(humanize('seatsBooked')).toBe('Seats booked')
  })

  it('leaves an empty string empty', () => {
    expect(humanize('')).toBe('')
  })
})

describe('initials', () => {
  it('takes the first letters of the first and last words', () => {
    expect(initials('  dara  k  driver ')).toBe('DD')
  })

  it('works with a single name', () => {
    expect(initials('Madonna')).toBe('M')
  })
})
