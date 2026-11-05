// Shapes of the auth data, from the backend's OpenAPI spec (/api-docs).
// Each Zod schema checks data at runtime; its type comes from z.infer, so the two never disagree.

import { z } from 'zod'

export const roleSchema = z.enum(['DRIVER', 'RIDER', 'ADMIN'])
export type Role = z.infer<typeof roleSchema>

// The user object every auth endpoint returns inside { user: ... }.
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  roles: z.array(roleSchema), // a user can have several roles
  createdAt: z.string(), // ISO date text, e.g. "2026-11-01T14:06:44.383Z"
  phoneVerified: z.boolean(), // false → most routes answer 403 PhoneNotVerifiedError
})
export type User = z.infer<typeof userSchema>

// Every auth endpoint answers { user: {...} }.
export const userResponseSchema = z.object({ user: userSchema })

export const resendCodeResponseSchema = z.object({
  message: z.string(),
  resendAfterSeconds: z.number(),
})
export type ResendCodeResponse = z.infer<typeof resendCodeResponseSchema>

// name@domain.tld. No part can overlap another, so even a huge input is checked fast.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/
// Indian mobile numbers: 10 digits, starting with 6, 7, 8 or 9 (the backend's rule).
const MOBILE_PATTERN = /^[6-9]\d{9}$/
export const MIN_PASSWORD_LENGTH = 8

// Shared by login and signup, so the email rule lives in one place.
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .regex(EMAIL_PATTERN, 'Enter a valid email, like name@example.com')

// The body of POST /api/auth/login. No length rule on the password:
// "min 8 characters" applies when a password is CREATED (signup).
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})
export type LoginValues = z.infer<typeof loginSchema>

// The roles you can pick at signup (ADMIN can't be chosen).
export const SIGNUP_ROLES = ['RIDER', 'DRIVER'] as const
export type SignupRole = (typeof SIGNUP_ROLES)[number]

// The body of POST /api/auth/signup.
export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: emailSchema,
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(MOBILE_PATTERN, 'Enter a 10-digit mobile number, like 9876543210'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
  role: z.enum(SIGNUP_ROLES, { error: 'Choose how you’ll use the app' }),
})
export type SignupValues = z.infer<typeof signupSchema>
