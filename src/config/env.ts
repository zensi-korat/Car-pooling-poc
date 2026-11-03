// The ONE place the app reads env variables (set in .env, see .env.example).
// Everything else imports `env` from here, so settings and defaults live together.

export const env = {
  // Shown in the header and the browser tab.
  appName: import.meta.env.VITE_APP_NAME || 'Pool',
  // '' = same origin (dev proxy). A full URL = call the backend directly (cross-origin).
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
}
