import { describe, expect, it } from 'vitest'
import { toSearchParams } from '../search'

const kalupur = { id: 'a', label: 'Kalupur Railway Station', address: 'Ahmedabad', lat: 23.0247, lng: 72.6031 }
const iskcon = { id: 'b', label: 'Iskcon Cross Roads', address: 'Ahmedabad', lat: 23.0273, lng: 72.5075 }

describe('toSearchParams', () => {
  it('sends only the route when no dates are chosen', () => {
    expect(toSearchParams({ origin: kalupur, destination: iskcon, dates: {} })).toEqual({
      originLat: 23.0247,
      originLng: 72.6031,
      destLat: 23.0273,
      destLng: 72.5075,
    })
  })

  it('turns the day range into a window from the first day’s start to the last day’s end', () => {
    const params = toSearchParams({
      origin: kalupur,
      destination: iskcon,
      dates: { from: '2026-11-20', to: '2026-11-21' },
    })
    expect(params.earliestDeparture).toBe(new Date(2026, 10, 20, 0, 0, 0, 0).toISOString())
    expect(params.latestDeparture).toBe(new Date(2026, 10, 21, 23, 59, 59, 999).toISOString())
  })
})
