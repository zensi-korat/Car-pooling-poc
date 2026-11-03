// Form validation rules: plain functions, no React. Easy to read and to test.
// They only check what the browser can know (filled? right shape?). The server
// still checks everything again; its messages show under the fields too.

import { SIGNUP_ROLES, type LoginValues, type SignupValues } from '../types'

// One optional message per field, e.g. { email: 'Email is required' }.
export type LoginErrors = Partial<Record<keyof LoginValues, string>>
export type SignupErrors = Partial<Record<keyof SignupValues, string>>

// name@domain.tld. No part can overlap another, so even a huge input is checked fast.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/
// Indian mobile numbers: 10 digits, starting with 6, 7, 8 or 9 (the backend's rule).
const MOBILE_PATTERN = /^[6-9]\d{9}$/
const MIN_PASSWORD_LENGTH = 8

// Shared by login and signup, so the email rule lives in one place.
function emailError(email: string): string | undefined {
  if (!email) return 'Email is required'
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email, like name@example.com'
  return undefined
}

export function validateLogin({ email, password }: LoginValues): LoginErrors {
  const errors: LoginErrors = {}

  const emailMessage = emailError(email)
  if (emailMessage) errors.email = emailMessage

  // No length rule here: "min 8 characters" applies when a password is CREATED (signup).
  if (!password) errors.password = 'Password is required'

  return errors
}

export function validateSignup({ name, email, phone, password, role }: SignupValues): SignupErrors {
  const errors: SignupErrors = {}

  if (!name) errors.name = 'Name is required'

  const emailMessage = emailError(email)
  if (emailMessage) errors.email = emailMessage

  if (!phone) errors.phone = 'Phone number is required'
  else if (!MOBILE_PATTERN.test(phone)) errors.phone = 'Enter a 10-digit mobile number, like 9876543210'

  if (!password) errors.password = 'Password is required'
  else if (password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`

  if (!SIGNUP_ROLES.includes(role)) errors.role = 'Choose how you’ll use the app'

  return errors
}

// {} → true. Works for any form's errors object.
export function isValid(errors: Record<string, string | undefined>): boolean {
  return Object.keys(errors).length === 0
}
