import { describe, expect, it } from 'vitest'
import { straightLine } from '../map'

describe('straightLine', () => {
  it('goes from the start to the end, latitude first', () => {
    expect(straightLine({ originLat: 23.02, originLng: 72.6, destLat: 23.22, destLng: 72.65 })).toEqual([
      [23.02, 72.6],
      [23.22, 72.65],
    ])
  })
})
