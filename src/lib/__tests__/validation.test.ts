import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { fieldErrors, isValid } from '../validation'

describe('fieldErrors()', () => {
  const schema = z.object({ name: z.string().min(1, 'Name is required').min(3, 'Too short') })

  it('gives each failing field its first message', () => {
    expect(fieldErrors(schema, { name: '' })).toEqual({ name: 'Name is required' })
  })

  it('is empty when everything passes', () => {
    expect(fieldErrors(schema, { name: 'Asha' })).toEqual({})
  })
})

describe('isValid()', () => {
  it('is true only when there are no errors', () => {
    expect(isValid({})).toBe(true)
    expect(isValid({ email: 'Email is required' })).toBe(false)
  })
})
