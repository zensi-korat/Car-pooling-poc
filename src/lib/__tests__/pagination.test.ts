import { describe, expect, it } from 'vitest'
import { readPage, readPageSize } from '../pagination'

describe('readPage', () => {
  it.each([
    ['3', 3],
    [null, 1],
    ['abc', 1],
    ['0', 1],
    ['-2', 1],
    ['1.5', 1],
  ])('%s → %s', (value, expected) => {
    expect(readPage(value)).toBe(expected)
  })
})

describe('readPageSize', () => {
  it.each([
    ['25', 25],
    ['100', 100],
    [null, 50],
    ['9999', 50],
    ['abc', 50],
  ])('%s → %s', (value, expected) => {
    expect(readPageSize(value)).toBe(expected)
  })
})
