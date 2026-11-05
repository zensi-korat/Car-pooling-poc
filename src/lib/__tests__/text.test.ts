import { describe, expect, it } from 'vitest'
import { humanize } from '../text'

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
