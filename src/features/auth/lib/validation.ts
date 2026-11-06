// Form validation: the rules live in the Zod schemas (api/authSchema.ts); this turns
// Zod's result into one message per field, the shape the forms show under each input.
// The server still checks everything again; its messages show under the fields too.

import { fieldErrors } from '@/lib/validation'
import { loginSchema, signupSchema, type LoginValues, type SignupValues } from '../api/authSchema'

// One optional message per field, e.g. { email: 'Email is required' }.
export type LoginErrors = Partial<Record<keyof LoginValues, string>>
export type SignupErrors = Partial<Record<keyof SignupValues, string>>

export function validateLogin(values: LoginValues): LoginErrors {
  return fieldErrors(loginSchema, values)
}

export function validateSignup(values: SignupValues): SignupErrors {
  return fieldErrors(signupSchema, values)
}
