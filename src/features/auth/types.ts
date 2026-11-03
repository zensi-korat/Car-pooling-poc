// Shapes of the auth data, copied from the backend's OpenAPI spec (/api-docs).
// Shared by the API functions, the forms and the pages.

// A union of exact strings: TypeScript rejects 'driver' or 'PASSENGER'.
export type Role = 'DRIVER' | 'RIDER' | 'ADMIN'

// The user object every auth endpoint returns inside { user: ... }.
export type User = {
  id: string
  name: string
  email: string
  phone: string
  roles: Role[] // a user can have several roles
  createdAt: string // ISO date text, e.g. "2026-11-01T14:06:44.383Z"
  phoneVerified: boolean // false → most routes answer 403 PhoneNotVerifiedError
}

// The body of POST /api/auth/login.
export type LoginValues = {
  email: string
  password: string
}

// The roles you can pick at signup (ADMIN can't be chosen). A real list we can .map()
// over in the form; SignupRole ('RIDER' | 'DRIVER') is built from it, so they never disagree.
export const SIGNUP_ROLES = ['RIDER', 'DRIVER'] as const
export type SignupRole = (typeof SIGNUP_ROLES)[number]

// The body of POST /api/auth/signup.
export type SignupValues = {
  name: string
  email: string
  phone: string // 10-digit Indian mobile number, e.g. "9876543210"
  password: string // at least 8 characters
  role: SignupRole
}
