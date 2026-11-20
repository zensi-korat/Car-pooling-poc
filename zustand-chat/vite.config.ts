/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  server: {
    // Like Pool's /api proxy: the browser only talks to Vite, Vite forwards to our server.
    proxy: {
      '/api': 'http://localhost:4000',
      '/ws': { target: 'ws://localhost:4000', ws: true }, // ws: a connection that stays open
    },
  },
  // happy-dom: a small fake browser (localStorage, BroadcastChannel…) so stores can be tested in Node.
  test: { environment: 'happy-dom' },
})
