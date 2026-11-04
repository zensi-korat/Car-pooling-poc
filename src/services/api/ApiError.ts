// The one error type every failed request turns into, so screens handle errors one way.

// The backend's error body, in one of two shapes:
//   { "error": "UnauthenticatedError", "message": "Invalid email or password" }
//   { "error": "ValidationError", "details": { "phone": ["enter a valid 10-digit…"] } }
export type ErrorBody = { error?: string; message?: string; details?: Record<string, string[]> }

// A real Error subclass, so `catch (err)` can check `err instanceof ApiError`
// and then branch on err.status / err.code instead of parsing strings.
export class ApiError extends Error {
  readonly status: number // HTTP status; 0 = the request never reached the server
  readonly code: string // the backend's "error" field, e.g. "PhoneNotVerifiedError"

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

// The options every api() call accepts, whichever client is behind it.
export type ApiOptions = {
  method?: Method
  body?: unknown
  // Query string: { page: 2, role: 'RIDER' } → ?page=2&role=RIDER. undefined values are left out.
  params?: Record<string, string | number | undefined>
  signal?: AbortSignal
}

export const NETWORK_ERROR_MESSAGE = "Can't reach the server. Check your connection and try again."
