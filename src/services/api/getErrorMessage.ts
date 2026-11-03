import { ApiError } from './ApiError'

// Turns anything a request threw into ONE sentence to show the user.
// ApiError.message is already the server's own message (e.g. "Invalid email or password"),
// or our network/fallback text when the server sent none, so we show it as it is.
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  // Not an ApiError = a bug in our own code; don't show its technical text to users.
  return 'Something went wrong. Please try again.'
}
