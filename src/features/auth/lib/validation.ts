// Form validation: the rules live in the Zod schemas (api/authSchema.ts); this turns
// Zod's result into one message per field, the shape the forms show under each input.
// The server still checks everything again; its messages show under the fields too.

import type { z } from 'zod'
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

// {} → true. Works for any form's errors object.
export function isValid(errors: Record<string, string | undefined>): boolean {
  return Object.keys(errors).length === 0
}

// Zod lists every failed rule; a field shows only its first one ("required" before "valid email").
function fieldErrors<T extends object>(schema: z.ZodType<T>, values: T): Partial<Record<keyof T, string>> {
  const result = schema.safeParse(values)
  const errors: Partial<Record<keyof T, string>> = {}
  if (result.success) return errors
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof T
    errors[field] ??= issue.message
  }
  return errors
}
