// Types for our own env variables. Vite only exposes ones starting with VITE_
// to the browser. Every name here must also be listed in .env.example.
interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string
  readonly VITE_API_BASE_URL?: string
}
