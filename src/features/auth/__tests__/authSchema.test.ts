import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { loginSchema, profileFormSchema, signupSchema, verifyPhoneFormSchema } from '../api/authSchema'

// The first message per field: what the form shows under each input.
function errorsOf(schema: z.ZodType, values: unknown): Record<string, string | undefined> {
  const result = schema.safeParse(values)
  if (result.success) return {}
  const fields: Record<string, string[] | undefined> = z.flattenError(result.error).fieldErrors
  return Object.fromEntries(Object.entries(fields).map(([field, messages]) => [field, messages?.[0]]))
}

describe('loginSchema', () => {
  it('valid email + any password → no errors', () => {
    expect(errorsOf(loginSchema, { email: 'asha@example.com', password: 'x' })).toEqual({})
  })

  it('empty fields → "required" for both', () => {
    expect(errorsOf(loginSchema, { email: '', password: '' })).toEqual({
      email: 'Email is required',
      password: 'Password is required',
    })
  })

  it.each(['asha', 'asha@', 'asha@example', '@example.com', 'a sha@example.com', 'asha@x..com'])(
    'rejects "%s" as an email',
    (email) => {
      expect(errorsOf(loginSchema, { email, password: 'x' }).email).toBe('Enter a valid email, like name@example.com')
    },
  )

  it.each(['asha@example.com', 'a.b+rides@mail.co.in'])('accepts "%s"', (email) => {
    expect(errorsOf(loginSchema, { email, password: 'x' }).email).toBeUndefined()
  })

  it('does NOT enforce a minimum password length on login', () => {
    expect(errorsOf(loginSchema, { email: 'asha@example.com', password: '123' }).password).toBeUndefined()
  })
})

describe('signupSchema', () => {
  const valid = {
    name: 'Asha Patel',
    email: 'asha@example.com',
    phone: '9876543210',
    password: 'longenough',
    role: 'RIDER' as const,
  }

  it('valid values → no errors', () => {
    expect(errorsOf(signupSchema, valid)).toEqual({})
  })

  it('empty fields → "required" messages', () => {
    expect(errorsOf(signupSchema, { ...valid, name: '', email: '', phone: '', password: '' })).toEqual({
      name: 'Name is required',
      email: 'Email is required',
      phone: 'Phone number is required',
      password: 'Password is required',
    })
  })

  it('uses the same email rule as login', () => {
    expect(errorsOf(signupSchema, { ...valid, email: 'asha@' }).email).toBe(
      'Enter a valid email, like name@example.com',
    )
  })

  it.each(['12345', '98765432101', '5876543210', '98765-4321', '+919876543210'])(
    'rejects phone "%s" (the backend wants a 10-digit Indian mobile number)',
    (phone) => {
      expect(errorsOf(signupSchema, { ...valid, phone }).phone).toBe('Enter a 10-digit mobile number, like 9876543210')
    },
  )

  it.each(['9876543210', '6000000000', '7123456789', '8999999999'])('accepts phone "%s"', (phone) => {
    expect(errorsOf(signupSchema, { ...valid, phone }).phone).toBeUndefined()
  })

  it('password: 7 characters is too short, 8 is enough (the backend minimum)', () => {
    expect(errorsOf(signupSchema, { ...valid, password: '1234567' }).password).toBe(
      'Password must be at least 8 characters',
    )
    expect(errorsOf(signupSchema, { ...valid, password: '12345678' }).password).toBeUndefined()
  })

  it('role must be RIDER or DRIVER', () => {
    expect(errorsOf(signupSchema, { ...valid, role: 'ADMIN' }).role).toBe('Choose how you’ll use the app')
    expect(errorsOf(signupSchema, { ...valid, role: 'DRIVER' }).role).toBeUndefined()
  })
})

describe('trimming', () => {
  it('only spaces count as empty', () => {
    expect(errorsOf(signupSchema, { name: '   ' }).name).toBe('Name is required')
    expect(errorsOf(profileFormSchema, { name: '   ' }).name).toBe('Name is required')
  })

  it('parse() returns the values with the spaces removed (passwords untouched)', () => {
    expect(loginSchema.parse({ email: '  asha@example.com ', password: ' secret ' })).toEqual({
      email: 'asha@example.com',
      password: ' secret ',
    })
  })
})

describe('verifyPhoneFormSchema', () => {
  it.each(['', '12345', '1234567', '12a456'])('rejects code "%s"', (code) => {
    expect(errorsOf(verifyPhoneFormSchema, { code }).code).toBe('Enter the 6-digit code from the SMS')
  })

  it('accepts 6 digits', () => {
    expect(errorsOf(verifyPhoneFormSchema, { code: '123456' })).toEqual({})
  })
})
