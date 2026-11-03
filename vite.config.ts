/// <reference types="vitest/config" />
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
// A function instead of an object: Vite tells us the command ('serve' = npm run dev,
// 'build' = npm run build) and the mode ('development' / 'production' / 'test').
export default defineConfig(({ command, mode }) => {
  // This file runs BEFORE Vite loads .env for the app, so we load it ourselves.
  // '' = load every variable, not only VITE_* ones (API_PROXY_TARGET has no prefix).
  const env = loadEnv(mode, process.cwd(), '')

  // Fail fast with a clear message instead of a confusing 502 later.
  if (command === 'serve' && mode !== 'test' && !env.API_PROXY_TARGET) {
    throw new Error('API_PROXY_TARGET is missing. Copy .env.example to .env:  cp .env.example .env')
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      // "@/components/ui/button" → "src/components/ui/button"
      alias: { '@': path.resolve(import.meta.dirname, './src') },
    },
    server: {
      // The browser only ever talks to the Vite dev server (one origin).
      // Vite forwards /api/* to the backend behind the scenes, so the backend's
      // cookies belong to our origin and are sent back automatically.
      // The hosted backend does NOT allow CORS from localhost, so calling it
      // directly from the browser would be blocked. Vite is a server, not a
      // browser, so CORS doesn't apply to it.
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET, // from .env (see .env.example)
          // Sets the Host header to the backend's host; Render uses it to pick our app.
          changeOrigin: true,
        },
      },
    },
  }
})
