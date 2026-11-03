import { describe, expect, it } from 'vitest'
import { ApiError } from '../ApiError'
import { getErrorMessage } from '../getErrorMessage'

describe('getErrorMessage()', () => {
  it("shows the server's own message", () => {
    const err = new ApiError(401, 'UnauthenticatedError', 'Invalid email or password')
    expect(getErrorMessage(err)).toBe('Invalid email or password')
  })

  it('shows rate-limit messages from the server as they are', () => {
    const err = new ApiError(429, 'TooManyRequestsError', 'Too many failed logins, try again later')
    expect(getErrorMessage(err)).toBe('Too many failed logins, try again later')
  })

  it('hides technical text from non-API errors (bugs in our code)', () => {
    expect(getErrorMessage(new TypeError("Cannot read properties of undefined (reading 'x')"))).toBe(
      'Something went wrong. Please try again.',
    )
  })
})
