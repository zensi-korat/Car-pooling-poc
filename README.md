# Pool: car-pooling web app

React + TypeScript + Vite, styled with Tailwind + shadcn/ui. Built step by step as a learning project. See [LEARN.md](LEARN.md).

Backend: Ride Sharing POC API (Swagger: https://ride-sharing-poc-76s7.onrender.com/api-docs/).

## Local development setup

Requires Node 20+.

```bash
npm install
cp .env.example .env     # then adjust the values if needed
npm run dev              # prints the local URL (5173, or the next free port)
```

### Environment variables

Real values live in `.env`, which is **git-ignored**. Every variable is listed and explained in [`.env.example`](.env.example).

| Variable | Read by | Purpose |
|---|---|---|
| `VITE_APP_NAME` | Browser | App name in the header and the tab title |
| `VITE_API_BASE_URL` | Browser | Empty = same origin through the dev proxy (recommended). A full URL = call the backend directly (needs CORS on the backend) |
| `API_PROXY_TARGET` | `vite.config.ts` only | Where the dev proxy forwards `/api/*` (the hosted backend, or `http://localhost:10000`) |

- `VITE_*` values are bundled into the browser code, so **never put secrets in them**.
- In the app, read them through `src/config/env.ts`, not `import.meta.env` directly.
- Adding a variable: add it to `.env.example` and to `src/env.d.ts` (for its type). Add it to `src/config/env.ts` too if the browser needs it.
- `.env.test` (committed, fake values) is loaded automatically when tests run.
- After editing `.env`, restart `npm run dev`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload and the `/api` proxy |
| `npm run check` | Type-check + lint + tests |
| `npm test` | Tests only (Vitest) |
| `npm run build` | Production build into `dist/` |
