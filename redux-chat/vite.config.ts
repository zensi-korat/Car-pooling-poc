import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The same server as zustand-chat: run `npm run server` inside zustand-chat first.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
      '/ws': { target: 'ws://localhost:4000', ws: true },
    },
  },
})
