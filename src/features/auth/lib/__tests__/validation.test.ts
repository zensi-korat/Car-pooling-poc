import { describe, expect, it } from 'vitest'
import { validateLogin, validateSignup } from '../validation'

describe('validateLogin()', () => {
  it('valid email + any password → no errors', () => {
    expect(validateLogin({ email: 'asha@example.com', password: 'x' })).toEqual({})
  })

  it('empty fields → "required" for both', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: 'Email is required',
      password: 'Password is required',
    })
  })

  it.each(['asha', 'asha@', 'asha@example', '@example.com', 'a sha@example.com', 'asha@x..com'])(
    'rejects "%s" as an email',
    (email) => {
      expect(validateLogin({ email, password: 'x' }).email).toBe('Enter a valid email, like name@example.com')
    },
  )

  it.each(['asha@example.com', 'a.b+rides@mail.co.in'])('accepts "%s"', (email) => {
    expect(validateLogin({ email, password: 'x' }).email).toBeUndefined()
  })

  it('does NOT enforce a minimum password length on login', () => {
    expect(validateLogin({ email: 'asha@example.com', password: '123' }).password).toBeUndefined()
  })
})

describe('validateSignup()', () => {
  const valid = {
    name: 'Asha Patel',
    email: 'asha@example.com',
    phone: '9876543210',
    password: 'longenough',
    role: 'RIDER' as const,
  }

  it('valid values → no errors', () => {
    expect(validateSignup(valid)).toEqual({})
  })

  it('empty fields → "required" messages', () => {
    expect(validateSignup({ ...valid, name: '', email: '', phone: '', password: '' })).toEqual({
      name: 'Name is required',
      email: 'Email is required',
      phone: 'Phone number is required',
      password: 'Password is required',
    })
  })

  it('uses the same email rule as login', () => {
    expect(validateSignup({ ...valid, email: 'asha@' }).email).toBe('Enter a valid email, like name@example.com')
  })

  it.each(['12345', '98765432101', '5876543210', '98765-4321', '+919876543210'])(
    'rejects phone "%s" (the backend wants a 10-digit Indian mobile number)',
    (phone) => {
      expect(validateSignup({ ...valid, phone }).phone).toBe('Enter a 10-digit mobile number, like 9876543210')
    },
  )

  it.each(['9876543210', '6000000000', '7123456789', '8999999999'])('accepts phone "%s"', (phone) => {
    expect(validateSignup({ ...valid, phone }).phone).toBeUndefined()
  })

  it('password: 7 characters is too short, 8 is enough (the backend minimum)', () => {
    expect(validateSignup({ ...valid, password: '1234567' }).password).toBe('Password must be at least 8 characters')
    expect(validateSignup({ ...valid, password: '12345678' }).password).toBeUndefined()
  })

  it('role must be RIDER or DRIVER', () => {
    const withAdmin = { ...valid, role: 'ADMIN' } as unknown as Parameters<typeof validateSignup>[0]
    expect(validateSignup(withAdmin).role).toBe('Choose how you’ll use the app')
    expect(validateSignup({ ...valid, role: 'DRIVER' }).role).toBeUndefined()
  })
})
