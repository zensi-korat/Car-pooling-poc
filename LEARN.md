# Car-pooling: learn React by building it

One small step at a time. Each step: what we did, why, and what to look at.
Auth theory refresher: `~/JS-concepts/api-data-integration/src/auth/AUTH.md`.

## Progress

| # | Step | Status |
|---|------|--------|
| 1 | Create the project (Vite + React + TS) | ✅ |
| 2 | Tailwind + shadcn/ui + light / dark mode | ✅ |
| 3 | Vite proxy to the backend (why cookies need the same origin) | ✅ |
| 4 | `api()` with fetch + `ApiError` + first tests (no backend needed) | ✅ |
| 5 | The same `api()` with **axios**: fetch vs axios side by side | ✅ |
| 6 | Login page (UI only): controlled inputs, form submit | ✅ |
| 7 | Login → `POST /api/auth/login`: loading + error messages | ✅ |
| 8 | `AuthContext` + `GET /me` on page load | ✅ |
| 9 | Routing + protected routes | ✅ |
| 10 | Signup + role toggle (DRIVER / RIDER) | ✅ |
| 11 | Verify phone (6-digit code + resend countdown) | ✅ |
| 12 | Silent refresh on 401 (axios interceptor, one refresh at a time) | ✅ |
| 13 | Logout + profile (`PATCH /me`) | ✅ |
| 14 | Dashboard layout like bear-portal-new (sidebar + page sections) | ✅ |
| 15 | Admin: list users (TanStack Query, pagination, filters): see [LEARN-admin-users.md](LEARN-admin-users.md) | ✅ |

Later: React Hook Form + Zod, MSW mock backend for tests, the other admin lists (rides, audit logs, vehicles), then the car-pooling features (rides, bookings…). TanStack Query was added in step 15.

---

## Step 1: create the project

**What we ran:** `npm create vite@latest -- --template react-ts`, then `npm install`.

**What is Vite?** A dev server plus a build tool. `npm run dev` serves your code and updates the page as you save. `npm run build` bundles everything into `dist/` for production.

**The files that matter (read them in this order):**

| File | Job |
|------|-----|
| `index.html` | The only HTML page. It has an empty `<div id="root">` and loads `src/main.tsx`. |
| `src/main.tsx` | The entry point. `createRoot(...).render(<App />)` puts React into that div. `<StrictMode>` runs some code twice in dev to catch bugs (that's why effects run twice). |
| `src/App.tsx` | The first component. Right now it's the Vite demo with a counter. We replace it in step 2. |
| `package.json` | The scripts (`dev`, `build`, `lint`) and dependencies. |
| `vite.config.ts` | Vite settings. The backend proxy goes here in step 3. |
| `tsconfig*.json` | TypeScript settings: `app` for `src/`, `node` for `vite.config.ts`. |

**Try it:** `npm run dev` → open http://localhost:5173 → change some text in `App.tsx` and save. The page updates without losing the counter value. That's Hot Module Replacement (HMR).

**Check yourself:**
1. Which file decides *where* in the HTML React draws?
2. Why does a `console.log` inside an effect show twice in dev but not in production?

---

## Step 2: Tailwind + shadcn/ui + light / dark mode

### Part A: the tools (setup, nothing to memorise)

| Tool | What it is | Where |
|------|------------|-------|
| **Tailwind v4** | Utility classes: `flex gap-3 rounded-lg px-3`. You style right in the JSX, no separate CSS file per component. | `vite.config.ts` (plugin), `src/index.css` (`@import "tailwindcss"`) |
| **`@/` alias** | `@/components/ui/button` instead of `../../components/ui/button`. Needs to be set in **two** places: Vite (to run) and TS (to type-check). | `vite.config.ts` `resolve.alias`, `tsconfig*.json` `paths` |
| **shadcn/ui** | Not an npm library: the CLI **copies component source into your project** (`src/components/ui/`). You own it, you can read it and change it. Built on Radix (accessibility: keyboard, focus, ARIA). | `npx shadcn@latest add <name>`, config in `components.json` |
| **Nova preset** | The clean, minimal look: neutral greys, Geist font, Lucide icons. | `src/index.css` |

**How the colours work.** `index.css` defines **tokens** (CSS variables) twice: in `:root` (light) and in `.dark` (dark).
Components never use raw colours. They use token names like `bg-background`, `text-muted-foreground` and `bg-primary`.
So **adding one `dark` class to `<html>` switches the whole app.** That's the only job of our React code.

**`cn()`** (`src/lib/utils.ts`) merges class names safely: `cn('px-2', isBig && 'px-4')` → `'px-4'` (the later one wins, no clash). You'll see it in every shadcn component.

### Part B: the React concepts (this is the learning part)

Read the files in this order:

1. **`src/context/ThemeContext.ts`: `createContext`.**
   Context = a value that any component below a Provider can read, with no prop drilling.
   The default is `null` on purpose (see #3).

2. **`src/context/ThemeProvider.tsx`: the brain. Five ideas in about 50 lines:**
   - **Lazy initial state:** `useState(readStoredTheme)` passes the *function*, not `readStoredTheme()`. React calls it only on the first render, so we don't read localStorage on every render.
   - **Derived state:** `resolvedTheme` is *calculated* from `theme` + `systemIsDark`, not stored. Rule: if you can compute it, don't `useState` it.
   - **Effect with cleanup (effect 1):** subscribe to the OS dark-mode setting. The `return () => removeEventListener(...)` cleanup prevents a leak, and StrictMode runs the effect twice in dev to prove the cleanup works.
   - **Effect to sync with the outside world (effect 2):** `<html>` is outside React's tree, so changing it is a side effect and goes in `useEffect`, re-run only when `[resolvedTheme]` changes.
   - **try/catch around localStorage:** it can throw (private mode, blocked storage). The app must still work without it.

3. **`src/hooks/useTheme.ts`: a custom hook.**
   A function whose name starts with `use` and that calls other hooks. It hides `useContext` and **throws a clear error** if someone forgets the Provider, instead of a confusing "cannot read property of null".

4. **`src/components/ThemeToggle.tsx`: using it.**
   `const { theme, setTheme } = useTheme()`, then render the list with `.map` + `key`. `asChild` makes the Radix trigger *reuse* our `<Button>` instead of wrapping it in a second button.

5. **`src/main.tsx`:** `<ThemeProvider>` wraps `<App />`, so everything inside can call `useTheme()`.

6. **`index.html`: the no-flash script.** React loads *after* the HTML is painted. Without this tiny script, dark-mode users would see a white flash on every load. It must use the same `"theme"` key and `"dark"` class as the provider.

### Flow at a glance

```
click "Dark" → setTheme('dark') → state changes + saved to localStorage
            → ThemeProvider re-renders → resolvedTheme = 'dark'
            → effect 2 runs → <html class="dark"> → CSS tokens switch → whole app is dark
```

### Try it
1. `npm run dev`. Use the sun/moon button (top right) to try Light / Dark / System.
2. Choose **System**, then change your Mac's appearance (System Settings → Appearance). The app follows without a reload (effect 1).
3. Choose **Dark** and reload. There's no white flash (the `index.html` script).
4. Break it on purpose: remove `<ThemeProvider>` from `main.tsx` and read the error message. Then put it back.
5. DevTools → Application → Local Storage: watch the `theme` key change.

### Check yourself
1. Why is `resolvedTheme` not a `useState`?
2. What goes wrong if you delete the `return () => ...` cleanup in effect 1?
3. Why does `useState(readStoredTheme)` differ from `useState(readStoredTheme())`?
4. Why can't the no-flash fix live inside a React component?

---

## Step 3: Vite proxy (why cookies need the same origin)

**Backend facts (from Swagger):** base URL `http://localhost:10000`. Cookies: `token` (15 min) + `refresh_token` (7 days, `path=/api/auth`).
Mutations need the header `X-Requested-With: XMLHttpRequest`. `403 PhoneNotVerifiedError` = the user must verify their phone first.

### The problem
Frontend = `localhost:5173`, backend = `localhost:10000`. Different port = **different origin**.
If the browser called the backend directly, you'd need CORS with credentials on the server, `credentials: 'include'` on every fetch, and cookies that work across origins. That's a lot of moving parts (AUTH.md step 9, section 4).

### The fix: one origin
```
Browser ──► localhost:5173/api/auth/login ──(Vite forwards)──► localhost:10000/api/auth/login
        ◄── Set-Cookie: token=…           ◄──────────────────── Set-Cookie: token=…
```
The browser thinks it's only talking to `5173`. So:
- **No CORS at all.** Same origin means there's nothing to check.
- Cookies are stored for `localhost:5173` and sent back **automatically** on every `/api/...` call.
- `refresh_token`'s `path=/api/auth` still works, because the browser sees the path `/api/auth/refresh`.
- In code we write `fetch('/api/auth/me')`. **No base URL in the code at all.**

**In production** you do the same thing with your web server (Nginx, Vercel rewrites…): serve the app and proxy `/api` from one domain. The frontend code doesn't change.

### The config (`vite.config.ts`, `server.proxy`)
- `'/api'`: any request starting with `/api` gets forwarded.
- `target`: where to forward it.
- `changeOrigin: true`: sets the `Host` header to the backend's own host, which some servers check.

⚠️ The proxy only runs in `npm run dev`. Restart Vite after changing `vite.config.ts`.

### Try it
1. Start the backend (port 10000) and `npm run dev`.
2. Open http://localhost:5173/api/auth/me. You get the backend's **401** JSON (not logged in), served from port 5173. That's the proxy working.
3. Stop the backend and reload: **502 Bad Gateway** = Vite couldn't reach port 10000.

### Check yourself
1. Why don't we need CORS in dev with this setup?
2. Why must `fetch` URLs start with `/api` and not `http://localhost:10000/api`?
3. What does a 502 from `/api/...` tell you while debugging?

---

## Same origin or cross-origin? (what bear-portal-new does)

**bear-portal-new is cross-origin, but same-site:**

| | bear-portal-new | Car-pooling (now) |
|---|---|---|
| Frontend | `https://admin.bearmgmt.com` | `http://localhost:5173` |
| API | `https://qa-api.bearmgmt.com` (separate subdomain, shared by several portals) | `localhost:10000`, reached via the Vite proxy as `/api` |
| How the client calls it | axios `baseURL: NEXT_PUBLIC_APP_API_BASE_URL` + `withCredentials: true` | `fetch(BASE_URL + path, { credentials: 'include' })`, `BASE_URL = ''` |
| Cookies | `SameSite=Strict`. Sent only if both sides are on `*.bearmgmt.com` | Same origin, so cookies always work |
| Local dev cost | `/etc/hosts` entry + mkcert HTTPS certificate + backend CORS allow-list | None |

**Two words that are easy to mix up:**
- **Origin** = scheme + host + **port**. `localhost:5173` ≠ `localhost:10000`. Different origins need **CORS** to read responses.
- **Site** = scheme + registrable domain (no port, no subdomain). `admin.bearmgmt.com` and `qa-api.bearmgmt.com` are the **same site**. `SameSite` cookie rules look at the *site*.
- So bear-portal is *cross-origin* (needs CORS + `withCredentials`) but *same-site* (so `SameSite=Strict` cookies still flow). That's why its README makes you fake the `bearmgmt.com` domain locally.

**Why bear-portal chose cross-origin:** one API on its own subdomain serves several portals (admin, tenant…), and it's hosted separately (Amplify/CloudFront). Proxying through every portal would add a hop for no gain.

**Our decision:** stay **same origin** (Vite proxy) for now. It needs zero backend changes, and we don't know yet if the car-pooling backend allows CORS for `localhost:5173`. Note that the custom `X-Requested-With` header would also trigger a CORS *preflight* (an extra `OPTIONS` request the backend would have to answer).
But the client is written **like bear-portal's**, so switching is one env line: set `VITE_API_BASE_URL=http://localhost:10000` in `.env` and the backend must send `Access-Control-Allow-Origin: http://localhost:5173` + `Access-Control-Allow-Credentials: true`.

**Structure ideas we're borrowing from bear-portal** (as we need them, not all at once):
- `src/services/api/`: one shared client (theirs: `baseApiService.ts`, a singleton axios instance). ✅ now
- `src/features/<feature>/api/`, `components/`, `hooks/`: everything for one feature together (`features/auth/…`). From step 6.
- `__tests__/` folders next to the code they test. ✅ now
- Later: a Zod schema per response (`authApiSchema.ts`), one shared refresh promise for concurrent 401s (`baseApiService.ts`: `refreshPromise ??=`, the same idea as AUTH.md step 7), a hook per action (`useLogout`, `useCurrentUser`).

---

## Step 4: one API client + `ApiError` (tested without a backend)

**File:** `src/services/api/client.ts` (renamed to `fetchClient.ts` in step 5). Every request in the app goes through `api()`.

### Why one function?
Without it, every screen repeats: headers, `JSON.stringify`, `credentials`, `res.ok` checks, error parsing… and one day someone forgets the `X-Requested-With` header and gets a 403. Rules written once can't be forgotten.

### What `api()` does, top to bottom
1. **Headers:** `Accept: application/json` always. `Content-Type` only when there is a body. `X-Requested-With` on every non-GET (the backend's CSRF rule).
2. **`credentials: 'include'`:** send and accept cookies. Not strictly needed for same origin, but it makes the cross-origin switch a one-line change.
3. **`try/catch` around `fetch`:** fetch only *rejects* when there's **no response at all** (offline, server down, CORS block). We turn that into `ApiError(status 0, 'NetworkError')`. Exception: an `AbortError` (we cancelled it ourselves) is re-thrown untouched, so callers can ignore it.
4. **`204` → `undefined`:** no body to parse.
5. **`res.json().catch(() => null)`:** an error page might be plain text (Vite's 502). Parsing must never crash.
6. **`if (!res.ok)`:** ⚠️ fetch does **not** throw on 400/401/409/500. You must check. We throw an `ApiError` with `status`, `code` (the backend's `error` field) and `message`.
7. **`return data as T`:** the caller decides the type: `api<{ user: User }>('/api/auth/me')`. (`as T` is a *promise* to TypeScript, not a check. Zod will do real checking later.)

### TypeScript ideas in this file
- **Generic function `api<T>`:** one function, the return type chosen per call.
- **`class ApiError extends Error`:** a custom error you can test with `err instanceof ApiError`, then branch on `err.status === 409` / `err.code === 'PhoneNotVerifiedError'`.
- **Fields declared, then set in the constructor:** we can't write `constructor(readonly status: number)`, because `erasableSyntaxOnly` in tsconfig forbids TS-only syntax that generates JS.
- **`src/env.d.ts`:** tells TS that `import.meta.env.VITE_API_BASE_URL` exists. Vite only exposes env vars that start with `VITE_`, so never put secrets in them (they end up in the browser bundle).

### Testing without a backend (`src/services/api/__tests__/client.test.ts`)
The backend is off, so we **fake `fetch`**: `vi.stubGlobal('fetch', vi.fn(...))` returns whatever `Response` we build, then we check:
- what `api()` *sent* (method, headers, body, credentials): `fake.mock.calls[0]`
- what it *returned or threw* for 200, 409 JSON, 502 text, network failure, abort, 204.
`afterEach(vi.unstubAllGlobals)` puts the real fetch back so tests can't leak into each other.

Run: `npm test` (or `npm run check` = types + lint + tests).

### Try it
1. `npm test`. 8 tests pass.
2. Break it: in `client.ts` delete the `X-Requested-With` line and run `npm test`. Which test fails, and why does its name tell you exactly what broke? Put it back.
3. Change `if (!res.ok)` to `if (false)` and run the tests. That's what happens when you forget fetch doesn't throw on 4xx/5xx.

### Check yourself
1. `fetch` gets a 500 response. Does the `catch` around `fetch` run? Why not?
2. Why does `res.json()` have its own `.catch(() => null)`?
3. Why is `AbortError` re-thrown instead of becoming `ApiError(0)`?
4. Origin vs site: are `app.pool.com` and `api.pool.com` the same origin? The same site?
5. Why would `X-Requested-With` cause an extra `OPTIONS` request if we went cross-origin?

---

## Step 5: axios, and how it differs from fetch

**Goal:** write the *same* `api()` with axios, keep the fetch one, and prove both behave the same.

### What we did, one action at a time
| # | Action | Why |
|---|--------|-----|
| 1 | `npx npm@11 install axios` | axios runs in the browser, so it goes in `dependencies` (not `devDependencies`). We used npm 11 because npm 10.9.2 crashes on installs here. |
| 2 | New `ApiError.ts` | Both clients throw the same error, so it lives in a shared file. |
| 3 | `client.ts` → `fetchClient.ts` (`git mv` keeps history) | Kept as a reference to compare with. |
| 4 | New `axiosClient.ts` | The same job, done the axios way. |
| 5 | New `index.ts` | The "single door": the app imports `@/services/api` and never knows which client is behind it. |
| 6 | Tests run for **both** clients (`describe.each`) | Same tests passing = same behaviour. 8 tests × 2 = 16. |

### fetch vs axios, side by side

Open `fetchClient.ts` and `axiosClient.ts` next to each other. Every `[fetch]` comment is a chore axios does for you.

| Job | fetch (`fetchClient.ts`) | axios (`axiosClient.ts`) |
|-----|------|-------|
| What is it? | Built into every browser. Nothing to install. | A library (about 13 kB) on top of the browser's request tools. |
| Shared settings | You write your own wrapper function. | `axios.create({ baseURL, withCredentials, headers, timeout })` = an **instance**. |
| Sending JSON | `JSON.stringify(body)` + set `Content-Type` yourself. | Pass `data: body`. axios stringifies and sets the header. |
| Reading JSON | `await res.json()` (a second `await`). Crashes on non-JSON unless you catch it. | Already parsed: `response.data`. |
| **4xx / 5xx** | ⚠️ **Does not throw.** You must check `res.ok`. | **Throws** an `AxiosError` (with `error.response.status` and `.data`). |
| No response (offline) | Rejects with a `TypeError`. | Throws an `AxiosError` with no `response` (`code: 'ERR_NETWORK'`). |
| Cookies | `credentials: 'include'` | `withCredentials: true` |
| Timeout | Not built in (needs `AbortSignal.timeout()`). | `timeout: 15_000` |
| Cancel | `signal` (AbortController) → `AbortError` | Same `signal` → `CanceledError` (check with `axios.isCancel`). |
| Run code on **every** request/response | Not built in. | **Interceptors** (see below). |

**So which one?** Both are fine. fetch = zero dependencies, more code. axios = less code, plus interceptors. Most company projects (bear-portal-new included) use axios mainly **for interceptors**. Our app now uses axios (`index.ts`).

### Interceptors: the big new idea
An interceptor is a function axios runs **automatically** on every request or response that goes through the instance. Think of it as an airport security check that every bag passes through.

```
api() → [request interceptor] → server → [response interceptor] → your code
         adds X-Requested-With              turns AxiosError into ApiError
                                            (step 13: on 401 → refresh → retry)
```
- `http.interceptors.request.use(fn)`: `fn(config)` can change the request (we add the CSRF header to non-GETs), then **must `return config`**.
- `http.interceptors.response.use(onSuccess, onError)`: `onSuccess` gets 2xx responses. `onError` gets the thrown errors. We `return Promise.reject(toApiError(error))` so the error **stays an error**, just in our own shape.

### Testing tricks used
- **axios adapters:** axios doesn't send requests itself. An *adapter* does: `XMLHttpRequest` in browsers, `http` in Node, or `fetch`. Tests set `http.defaults.adapter = 'fetch'` so our fake `fetch` catches axios too. The real app keeps the browser default.
- **Full URL in tests:** `.env.test` → `VITE_API_BASE_URL` (moved there from `vite.config.ts` in the env-files update). In a browser `/api/...` is completed from the page address, but tests have no page.
- **`new Request(...)`** reads what was sent the same way for both clients (`req.headers.get(...)`, `await req.text()`).
- **Proving a test works:** we deleted the `X-Requested-With` line in `axiosClient.ts`. Exactly *"axiosClient: POST: sends JSON + the X-Requested-With header"* failed. Then we restored it.

### Try it
1. `npm test`. You'll see 16 passed.
2. In `axiosClient.ts`, delete `return config` inside the request interceptor and run `npm test`. What breaks, and why? (Hint: axios now gets `undefined` as the request.) Put it back.
3. In `axiosClient.ts`, replace `Promise.reject(toApiError(error))` with `toApiError(error)` (no reject). Run the tests. Why does a 409 now *resolve* instead of throw? Put it back.
4. In `index.ts`, switch to `fetchClient`, run `npm run check`, and switch back. Nothing else in the app needs to change: that's the point of the single door.

### Check yourself
1. Name two things fetch makes you do that axios does for you.
2. A request gets a 404. Which client throws by itself, and which needs `res.ok`?
3. What is an interceptor, and why must a request interceptor `return config`?
4. In the response interceptor's error function, why `Promise.reject(...)` and not just `return ...`?
5. Why do screens import from `@/services/api` and not from `axiosClient.ts`?

---

## Backend connected (hosted on Render)

**Where it lives:** `https://ride-sharing-poc-76s7.onrender.com` (Swagger: `/api-docs/`). Not on your machine, so `localhost:10000` had nothing.
Render's free plan **sleeps** when idle, so the first request after a break can take 30–60 s.

### How we checked it (you can run these yourself)
| # | Command | What we learned |
|---|---------|-----------------|
| 1 | `curl -i https://ride-sharing-poc-76s7.onrender.com/api/auth/me` | **401** `UnauthenticatedError` = the server is alive and checking logins. Also `ratelimit: limit=300` per 15 min. |
| 2 | Downloaded the OpenAPI spec (inside `/api-docs/swagger-ui-init.js`) | All 26 endpoints and the exact request bodies. No more pasting needed. |
| 3 | `curl -i -X OPTIONS …/api/auth/login -H "Origin: http://localhost:5175" …` | **No `Access-Control-Allow-Origin`** in the reply, so browsers on localhost are **not allowed** to call it directly (cross-origin is blocked). |
| 4 | Proxy `target` → the Render URL, then `curl -i http://localhost:<vite port>/api/auth/me` | **401** through Vite = the proxy works. CORS is a *browser* rule, and Vite is a server, so it isn't blocked. |

**So the same-origin decision is now proven, not just preferred:** this backend doesn't allow CORS from localhost, so the proxy is the only way the browser app can reach it.

`changeOrigin: true` matters here. Render (behind Cloudflare) picks the app by the `Host` header, so it must say `onrender.com`, not `localhost`.

### Auth details from the spec
| Endpoint | Body | Notes |
|---|---|---|
| `POST /api/auth/login` | `{ email, password }` | 401 = wrong email or password. **10 failed logins per 15 min** per IP |
| `POST /api/auth/signup` | `{ name, email, phone, password (min 8), role: 'DRIVER' \| 'RIDER' }` | 5 per hour per IP |
| `POST /api/auth/verify-phone` | `{ code }`, exactly 6 digits | 400 wrong code, 409 already verified, 429 too many tries |
| `POST /api/auth/verify-phone/resend` | (none) | `{ message, resendAfterSeconds }` → a countdown on the Resend button |
| `PATCH /api/auth/me` | `{ name }` (1–100 chars) | |
| user object | `{ id, name, email, phone, roles: ('DRIVER'\|'RIDER'\|'ADMIN')[], createdAt, phoneVerified }` | |

⚠️ **Gotcha for later (step 13):** a wrong password and an expired session both return `401 UnauthenticatedError`. The code alone can't tell them apart, so the refresh-on-401 logic must **skip** `/api/auth/login` (and `/refresh` itself).

**If the dev server shows 502 on `/api`:** restart `npm run dev` (Vite only reads `vite.config.ts` at startup, and it can break if `node_modules` was reinstalled while it ran).
**Port note:** your JS-concepts app uses 5173, so this app starts on the next free port (5174, 5175…). Check the terminal for the real URL.

---

## Step 6: the login page (UI only)

**Goal:** a good-looking login form that checks its fields. It doesn't talk to the server yet (step 7).

### What we did, one action at a time
| # | Action | Why |
|---|--------|-----|
| 1 | Updated the progress table | The backend works, so the mock backend (MSW) moved to "later". |
| 2 | `npx shadcn add input label` | `Input` = a styled `<input>` that passes every prop through (`{...props}`). `Label` = a `<label>` tied to its input via `htmlFor` ↔ `id` (click the text → focus the box. Screen readers say "Email"). |
| 3 | `src/features/auth/components/LoginForm.tsx` | The form: fields, show/hide password, checks. |
| 4 | `src/pages/LoginPage.tsx` | The screen: logo, theme switch, card, the form, the "Create an account" link. |
| 5 | `App.tsx` shows `<LoginPage />` | Routing (step 9) will choose pages by URL later. |

**Folders:** `features/auth/` = everything about auth (borrowed from bear-portal). `pages/` = whole screens.

### The 5 React ideas (numbered ①–⑤ in `LoginForm.tsx`)

**① Controlled inputs: state is the truth**
```tsx
const [email, setEmail] = useState('')
<Input value={email} onChange={(e) => setEmail(e.target.value)} />
```
Each key press → `onChange` → `setEmail(new text)` → React re-renders → the input shows the new `email`.
The input never "holds" anything itself. **React state is the single source of truth**, so we can read `email` anywhere in the component.
Try removing `onChange`: the box becomes read-only, because nothing updates the state it shows.

**② Toggling state**
```tsx
onClick={() => setShowPassword((shown) => !shown)}
type={showPassword ? 'text' : 'password'}
```
`(shown) => !shown` is the **updater form**: "take the current value, give back the opposite". It's safest whenever the new value depends on the old one.

**③ Form submit + `preventDefault()`**
`<form onSubmit={handleSubmit}>` runs on a button click **and** on pressing Enter in a field, for free.
Browsers' old default is to **reload the page** on submit. `e.preventDefault()` stops that, so React stays in charge.
⚠️ The 👁 button has `type="button"`. Any `<button>` inside a form is a *submit* button unless you say otherwise.

**④ Validation + conditional rendering**
`validate()` returns `{ email?: '…', password?: '…' }`. We store it in `errors` state, then:
```tsx
{errors.email && <p>{errors.email}</p>}   // draw the message only if there is one
aria-invalid={!!errors.email}              // red border + tells screen readers
```
`!!x` turns any value into a real `true`/`false` (`!!'Enter your email'` → `true`, `!!undefined` → `false`).
`validate` lives **outside** the component because it uses no state: it's a pure function, easy to test.
`noValidate` on the form turns off the browser's own popup bubbles, so only our messages show.

**⑤ Passing a function as a prop**
```tsx
// LoginPage
<LoginForm onSubmit={handleLogin} />
// LoginForm, when the values are valid
onSubmit(values)
```
The form collects input. The page decides what to do with it. In step 7 only `handleLogin` changes (it will call the API), and **the form stays exactly the same**.

### Small details worth noticing
- `autoComplete="email"` / `"current-password"` lets password managers fill the form.
- `aria-describedby="email-error"` connects the field to its error text for screen readers.
- We **never** show or `console.log` a password, not even in development.

### Try it
1. Restart `npm run dev` if you haven't since the backend change, and open the URL it prints.
2. Click **Log in** with empty fields: two messages and red borders.
3. Type `asha@` and submit: "That doesn't look like an email".
4. Click the 👁: the password appears. Click again: hidden.
5. Fill both correctly and press **Enter** (not the button): the confirmation box appears. That's ③.
6. Toggle dark mode: the form follows, because it only uses theme tokens.
7. Break it: delete `type="button"` from the 👁 button, then click the eye. What happens, and why? Put it back.

### Check yourself
1. What makes an input "controlled"?
2. Why `setShowPassword((shown) => !shown)` and not `setShowPassword(!showPassword)`? (Both work here; when could the second one be wrong?)
3. What would happen without `e.preventDefault()`?
4. Why does `LoginForm` take `onSubmit` as a prop instead of calling the API itself?
5. What does `!!errors.email` evaluate to when there's no error?

---

## Step 7: real login (loading + friendly errors)

**Goal:** the form from step 6 now logs in against the real backend.

### What we did, one action at a time
| # | File | Job |
|---|------|-----|
| 1 | `src/features/auth/types.ts` | `User`, `Role`, `LoginValues`: the server's data shapes, from the OpenAPI spec. Shared by every auth file. |
| 2 | `src/features/auth/api/authApi.ts` | `login(values)` → `POST /api/auth/login` → returns the `user`. Pages never write URLs. |
| 3 | `src/features/auth/lib/loginErrorMessage.ts` (+ 6 tests) | `ApiError` → one friendly sentence. |
| 4 | `LoginForm.tsx` | New `isSubmitting` prop: spinner, "Logging in…", disabled fields and button. Plus SonarQube fixes. |
| 5 | `src/pages/LoginPage.tsx` | `handleLogin` really logs in. Three pieces of state: `isSubmitting`, `error`, `user`. |

### The flow, from click to screen
```
click "Log in"
  → LoginForm checks the fields (step 6) → onSubmit(values)
  → LoginPage.handleLogin: setIsSubmitting(true), setError(null)
  → login(values)                          features/auth/api/authApi.ts
  → api('/api/auth/login', POST)           services/api (axios + interceptors)
  → Vite proxy → Render backend
       ✅ 200 { user } + Set-Cookie: token, refresh_token  (the browser stores them, httpOnly)
            → setUser(user) → the "Hi, Asha 👋" card
       ❌ 401 / 429 / 5xx / offline → ApiError
            → loginErrorMessage(err) → setError("Wrong email or password.") → red box
  → finally: setIsSubmitting(false) → spinner off
```

### The React ideas
**1. Async event handlers + `try` / `catch` / `finally`**
`async function handleLogin` lets us `await login(...)`. `finally` runs **whatever happens**, which is the right place to turn the spinner off. Without it, an error would leave the button spinning forever.

**2. Describe the screen with state**
Three small pieces of state, and the JSX just *reads* them:
| `user` | `error` | `isSubmitting` | What you see |
|---|---|---|---|
| null | null | false | The empty form |
| null | null | true | Spinner, disabled form, the "server waking up" hint |
| null | "Wrong email…" | false | The red box + the form |
| User | – | – | The "Hi, name" card |
You never "show" or "hide" things by hand. You change state, and React redraws.

**3. The loading state passed down as a prop**
The page owns `isSubmitting` and passes it to `<LoginForm isSubmitting={…} />`. The form only *displays* it. This is the same "page decides, form displays" idea as `onSubmit` in step 6. `disabled` also blocks **double submits**.

**4. Conditional rendering, three ways**
- `{error && <div>…</div>}`: draw *only if* there is an error.
- `{user ? <LoggedInCard /> : <Card>…form…</Card>}`: either one *or* the other.
- `{showPassword ? <EyeOff /> : <Eye />}`: the same idea inside a button.

**5. Lists with `.map` + `key`**
`user.roles.map((role) => <span key={role}>…</span>)` draws one badge per role. `key` must be **unique and stable** among siblings, and a role name is.

**6. `Fragment` (`<>…</>`)**
Groups the spinner and the text in the button without adding an extra element to the page.

### Code-quality fixes (from SonarQube in your editor)
- `FormEvent` → **`SubmitEvent`**: React's newer, more precise type for form submits.
- **`Readonly<Props>`**: props must never be changed by the component. Now TypeScript enforces it.
- **Email pattern** `\S+@\S+\.\S+` → `[^\s@]+@[^\s@.]+(\.[^\s@.]+)+`. In the old one, parts could overlap, so a long odd input made the browser try huge numbers of combinations (called *catastrophic backtracking*). In the new one, nothing overlaps: a 50,000-character trick input takes 1 ms.

### Why does reloading log you "out"?
`user` is just React state **in memory**. Reloading the page wipes it. But the **cookie is still in the browser**, so the server would still recognise you. We just never asked it. Step 8 asks on every page load (`GET /api/auth/me`) and keeps the user in an `AuthContext` that the whole app can read, the same Provider + hook pattern as the theme in step 2.

### Try it
1. Restart `npm run dev` and open the URL it prints.
2. A made-up email + any password → **"Wrong email or password."** (Render may need up to a minute the first time.)
3. While it's loading: the spinner, the disabled fields, and the hint text.
4. DevTools → **Network** tab → click the `login` request: look at the method, the `X-Requested-With` header (added by your interceptor!), the JSON body, and the 401 response.
5. With a real account: the "Hi, name" card with your roles. Then DevTools → **Application → Cookies**: you'll see `token` (and `refresh_token` only under the `/api/auth` path), marked **HttpOnly**. Type `document.cookie` in the Console: they're **not** there. That's httpOnly protecting you from XSS.
6. Reload the page: you're back at the form. Remember *why* (see above).
7. Turn off Wi-Fi and log in → "Can't reach the server…" (`status 0`).

⚠️ The backend allows only **10 failed logins per 15 minutes**. After that you'll see the 429 message (which is also a good test!).

### Check yourself
1. Why put `setIsSubmitting(false)` in `finally` instead of at the end of `try`?
2. Why do we `setError(null)` at the start of `handleLogin`?
3. What would happen if the button weren't `disabled` while submitting?
4. On the login request, 401 means "wrong password". What will 401 mean on other requests (step 12)?
5. Why can't your JavaScript read the `token` cookie, and why is that *good*?

---

## Env files (set up like bear-portal-new)

**Goal:** no settings hardcoded in code. Values live in `.env` files, and only safe ones are committed.

| File | Committed? | Holds |
|---|---|---|
| `.env.example` | ✅ yes | **Every** variable name, with a comment and a safe example. New developer: `cp .env.example .env` |
| `.env` | ❌ no (git-ignored) | **Your** real values. Change it freely (for example, a local backend) |
| `.env.test` | ✅ yes (exception in `.gitignore`) | Fake values for tests. Vitest loads it automatically ("test" mode) |
| `.env.development`, `.env.production` | ❌ no | Optional per-mode values (bear-portal uses `.env.development`). Not needed yet |

`.gitignore`: `.env`, `.env.*`, `!.env.example`, `!.env.test` (the `!` means "except").

### The prefix rule (the most important thing here)
| | Example | Who can read it |
|---|---|---|
| `VITE_` prefix | `VITE_APP_NAME`, `VITE_API_BASE_URL` | The **browser**. They are copied into the JS bundle, so **anyone can see them**. Never secrets! |
| No prefix | `API_PROXY_TARGET` | Only `vite.config.ts` (the dev server, in Node) |
bear-portal's version: `NEXT_PUBLIC_…` = browser, no prefix (like `AUTH_COOKIE_NAME`) = server only.

### How each place reads env
| Where | How | Why |
|---|---|---|
| App code (`src/`) | `import { env } from '@/config/env'` → `env.apiBaseUrl` | One file reads `import.meta.env`, so all settings and defaults are in one place |
| `src/config/env.ts` | `import.meta.env.VITE_…` | Vite replaces these with the real values when it builds |
| `vite.config.ts` | `loadEnv(mode, process.cwd(), '')` | The config runs **before** Vite loads `.env` for the app, so it loads it itself. `''` = all vars, not only `VITE_` |
| `index.html` | `%VITE_APP_NAME%` | Vite swaps it in the HTML too |
| TypeScript | `src/env.d.ts` | Declares which `VITE_` vars exist, so typos are caught |

### `||` vs `??` in `src/config/env.ts` (JS demo 12!)
- `appName: VITE_APP_NAME || 'Pool'`: an **empty** value should still become `'Pool'`.
- `apiBaseUrl: VITE_API_BASE_URL ?? ''`: an empty value is a **real choice** ("use the proxy"), so only a *missing* one falls back.

### Fail fast
`vite.config.ts` throws *"API_PROXY_TARGET is missing. Copy .env.example to .env"* if you forget `.env`. A clear error at startup beats a confusing 502 later.

### Try it
1. `git status`: `.env` is not listed (ignored), and `.env.example` / `.env.test` are.
2. Change `VITE_APP_NAME=Pool` to `VITE_APP_NAME=RideMate` in `.env`, restart `npm run dev`, and look at the header and the browser tab. Change it back.
3. Rename `.env` to `.env.off` and run `npm run dev`: read the error. Rename it back.
4. `npm run build`, then search `dist/assets/*.js` for `Pool`: that's the proof `VITE_` values end up in the browser code.

### Check yourself
1. Why is `API_PROXY_TARGET` not prefixed with `VITE_`?
2. You need a secret API key for a payment service. Can it go in `VITE_PAYMENT_KEY`? Why not?
3. Why can't `vite.config.ts` just use `import.meta.env`?
4. Why is `.env.test` committed when `.env` isn't?

---

## Cleanup: one client, server messages, a cleaner login form

### 1. `fetchClient.ts` removed
We only use axios now. (Step 5's comparison table above still explains the differences, as history.)
The tests now check just `axiosClient.ts` (8 tests instead of 8 × 2).

### 2. Errors show the **server's own message**
Before: `loginErrorMessage.ts` replaced the server's text with ours ("Wrong email or password.").
Now: `getErrorMessage(err)` (`src/services/api/getErrorMessage.ts`) shows `ApiError.message`, which **is** the server's `message`:
| What happened | Who wrote the text | Example |
|---|---|---|
| Server replied with `{ error, message }` | **The server** | "Invalid email or password" |
| Server replied without a message (a proxy's plain-text 502) | Us (`fallbackMessage` in `axiosClient.ts`) | "The server isn't responding properly (502)…" |
| No reply at all (offline) | Us (`NETWORK_ERROR_MESSAGE`) | "Can't reach the server…" |
| A bug in our code (not an `ApiError`) | Us | "Something went wrong. Please try again." |
**Why:** the backend knows best *why* a request failed, and the messages stay in sync with it. It's general, so signup and every later screen use it too (like bear-portal's `getApiErrorMessage`).

### 3. Validation in its own file: `src/features/auth/lib/validation.ts`
| Field | Rule | Message |
|---|---|---|
| Email | empty | Email is required |
| Email | not `name@domain.tld` | Enter a valid email, like name@example.com |
| Password | empty | Password is required |
- **No minimum length on login**: "min 8 characters" is a *signup* rule (creating a password). On login the server decides if it's right.
- **When errors show:** nothing before the first submit → all errors on submit → after that they update **as you type** (a message disappears the moment the field is fixed).
- `LoginErrors = Partial<Record<keyof LoginValues, string>>` = "an optional message per field". `keyof LoginValues` is `'email' | 'password'`.
- Pure functions with **12 tests** in `lib/__tests__/validation.test.ts`.

### 4. Reusable form components: `src/components/form.tsx` (one file)
| Component | Job |
|---|---|
| `FormField` | The shell: label → your input → error message |
| `TextField` | `FormField` + `Input`, with `aria-invalid` / `aria-describedby` wired for you |
| `PasswordField` | `FormField` + input + 👁 button. **Owns the show/hide state** |
| `FormAlert` | The red box for a server error (`role="alert"`) |
All four live in **one file**, `src/components/form.tsx`: they are small and closely related, so one file is easier to read. Import them together: `import { FormAlert, PasswordField, TextField } from '@/components/form'`. Signup (step 10) will reuse all of them.

**New React idea: "rest props"**
```tsx
function TextField({ id, label, error, ...inputProps }) {   // take what we need…
  return <Input id={id} {...inputProps} />                   // …pass the rest through
}
<TextField id="email" label="Email" type="email" value={…} onChange={…} />
//                                    └──────── these all end up on <Input> ────────┘
```
`ComponentProps<typeof Input>` = "every prop `Input` accepts", so TypeScript still checks them.
`Omit<…, 'type'>` in `PasswordField` = "all of those except `type`", because the field controls `type` itself (password ↔ text).

**Where state lives now**
| State | Lives in | Why there |
|---|---|---|
| show/hide password | `PasswordField` | Only the field cares |
| `values`, `errors`, `submitted` | `LoginForm` | The form's own business |
| `isSubmitting`, `error` (server), `user` | `LoginPage` | The page does the request |
Rule of thumb: **keep state in the lowest component that needs it.**

### 5. `LoginForm` is shorter (125 → 84 lines)
- `values` is **one object** instead of two `useState`s, with one `update(field, value)`:
  `const next = { ...values, [field]: value }`, spread (JS 06) + computed key (JS 04).
- `clean()` trims spaces around the email before checking or sending.

### Try it
1. Click **Log in** with empty fields: "Email is required" and "Password is required".
2. Type into the email field: watch the message change, then disappear when it's valid.
3. Wrong password: the red box shows the **server's** words, "Invalid email or password".
4. Open `TextField.tsx`: find where `type`, `value` and `onChange` go (hint: `...inputProps`).

### Check yourself
1. Why doesn't login check for a minimum password length?
2. What does `...inputProps` contain when you write `<TextField id="email" label="Email" type="email" />`?
3. Why does `PasswordField` keep `visible` itself instead of `LoginForm`?
4. When would the user see *our* message instead of the server's?

---

## Review fixes: the four "should fix" items

I reviewed the login page against React best practices and fixed the four most important findings.

### #1 `errors` is now **derived**, not stored (`LoginForm.tsx`)
```ts
// before: state + setErrors() in two places, kept in sync by hand
// after: recalculated on every render from `values`, so it can never be out of date
const errors = submitted ? validateLogin(clean(values)) : {}
```
Rule (same as `resolvedTheme` in step 2): **if you can calculate it from other state or props, don't `useState` it.** A stored copy is the classic way the screen ends up showing old data.
Bonus: `update` now uses the updater form `setValues((prev) => ({ ...prev, [field]: value }))`.

### #2 Focus moves to the first wrong field: **`useRef`** (`LoginForm.tsx`)
A **ref** is a box (`{ current: … }`) that survives re-renders **without causing** one.
Its most common job is holding a **real DOM element**: `ref={emailRef}` → React puts the `<input>` in `emailRef.current` → we can call `emailRef.current.focus()`.
On submit with errors: `FIELD_ORDER.find(field => found[field])` picks the first wrong field in screen order and focuses it. Keyboard and screen-reader users land right on the problem.
| `useState` | `useRef` |
|---|---|
| Changing it **re-renders** | Changing `.current` does **not** re-render |
| For what the screen shows | For things the screen doesn't show: DOM elements, timers, previous values |
| Read it during render ✅ | Read `.current` only in **event handlers / effects**, never during render ❌ |
⚠️ The linter caught us: we first put the refs inside an object (`inputRefs.email`). Then it can't tell "passing the ref" from "reading `.current` during render". The fix: **one variable per ref**, and build the `{ email, password }` lookup only inside the submit handler.
React 19: `ref` is now a **normal prop**. `TextField` passes it on to `Input` through `...inputProps`, so no `forwardRef` is needed (older tutorials use it).

### #3 `PasswordField` merges classes instead of replacing them (`form.tsx`)
`className={cn('h-10 pr-10', className)}`. Before, a passed `className` replaced `pr-10`, and the text ran under the 👁 button.
Also: **in JSX, later props win.** So the order is now `{...inputProps}` → `{...inputA11y}` → `className`. The caller's props first, then our id/aria wiring (so it can't be overwritten by accident), then the merged classes.

### #4 Unique ids: **`useId`** (`form.tsx`)
`id` was hardcoded (`"email"`, `"password"`). An `id` must be **unique on the whole page**, so two forms together would mix up their labels and error messages.
`useId()` returns an id that is unique on the page **and stable** (the same on every render). `id` is now **optional** on `TextField` / `PasswordField`, and `LoginForm` doesn't pass any.
⚠️ Never use `Math.random()` for ids: it changes on every render, so the label loses its input.

The id + `aria-*` logic is shared by both fields, so it lives in a small **custom hook** inside `form.tsx`: `useFieldA11y(id, error)` → `{ id, errorId, inputA11y }`. ("a11y" = accessibility, with 11 letters between the a and the y.)

### Try it
1. Submit the empty form: the cursor jumps into **Email**. Type a valid email and submit again: it jumps to **Password**.
2. DevTools → Elements → inspect the email input: its `id` is generated, and the label's `for` matches it.
3. Type in a field after a failed submit: messages update live (that's #1, the derived `errors`).

### Check yourself
1. Why is `errors` no longer a `useState`?
2. What's the difference between changing state and changing `ref.current`?
3. Why must `.current` not be read during render?
4. Why is `useId()` better than `Math.random()` for an id?
5. In `<Input {...inputProps} className="a" />`, which `className` wins if `inputProps` also has one?

---

## Reference: the server's error messages (tested with real requests)

Every error = an **HTTP status** + a small **JSON body**, in one of two shapes:
```json
{ "error": "UnauthenticatedError", "message": "Invalid email or password" }   ← most errors
{ "error": "ValidationError", "details": { "email": ["Invalid email"] } }     ← 400 only, NO "message"
```
- `error` = the **code name** of the kind of problem (for code, `err.code`).
- `message` = the **sentence** for the user (what the red box shows).
- `details` = problems **per field** (only for validation errors).

| Status | `error` | Server's words | Plain meaning |
|---|---|---|---|
| 400 | `ValidationError` | `details: { email: ["Required"], password: ["Required"] }` | Required fields missing |
| 400 | `ValidationError` | `details: { email: ["Invalid email"] }` | Not an email address |
| 401 | `UnauthenticatedError` | Invalid email or password | Unknown email **or** wrong password (it won't say which, to protect accounts) |
| 401 | `UnauthenticatedError` | Authentication required | (other routes) You're not logged in, or your session expired |
| 403 | `ForbiddenError` | Missing required CSRF header | The request lacks `X-Requested-With` (our interceptor always adds it) |
| 403 | `PhoneNotVerifiedError` | – | (other routes) Verify your phone first (step 11) |
| 429 | – | Too many failed logins… | 10 failed logins per 15 minutes per IP. **Even 400s count** |
| 5xx | – | (often no JSON) | The server itself failed |

**401 vs 403:** 401 = "I don't know **who** you are". 403 = "I know who you are (or what this is), but it's **not allowed**".

⚠️ **Known gap:** 400 replies have no `message`, so our app shows the fallback "Something went wrong (400)…". Our form blocks empty or invalid fields before sending, so it's rare on login, but signup will need `details` handled (show each message under its field).

---

## Reference: `type` vs `interface` vs union vs `enum`: which to use?

| You want to describe… | Use | Example in our code |
|---|---|---|
| A fixed set of **values** (roles, statuses) | **Union of strings** | `type Role = 'DRIVER' \| 'RIDER' \| 'ADMIN'` (`features/auth/types.ts`) |
| The same set, but you also need the values **as a list at runtime** (to loop over or render) | **`as const` array** + derive the type | `const FIELD_ORDER = ['email', 'password'] as const` (`LoginForm.tsx`) |
| "One of several situations, each with its own data" | **Discriminated union** (shared field like `status`) | `AuthState` (`features/auth/useAuth.ts`) |
| An object's **shape** (props, API data) | **`type`** (our default) | `type User = {…}`, `type LoginFormProps = {…}` |
| A shape someone else declared that you must **add to** (declaration merging) | **`interface`** | `interface ImportMetaEnv` (`src/env.d.ts`) adds our env vars to Vite's |
| Combine or transform types | **`type`** (only `type` can) | `AuthState & { login }`, `Partial<Record<…>>`, `Omit<…, 'type'>` |
| `enum` | ❌ **Not allowed here** | `tsconfig.app.json` → `"erasableSyntaxOnly": true` rejects it (error TS1294) |

**Why no `enum`?** An `enum` is one of the few TypeScript features that **creates real JavaScript code**. Types are normally erased when TS becomes JS, and `erasableSyntaxOnly` keeps it that way, which is what modern tools (Vite, Node's built-in TS support) expect. A union does the same job with **zero** runtime code, and the API's JSON already gives us plain strings like `"DRIVER"`, which a union matches directly.
**Need the list at runtime too?** (e.g. role buttons on the signup page)
```ts
const ROLES = ['DRIVER', 'RIDER'] as const   // a real array you can .map()
type SignupRole = (typeof ROLES)[number]     // 'DRIVER' | 'RIDER', derived, never out of sync
```
**`type` vs `interface` for objects:** both work. We use `type` everywhere for consistency, because only `type` can do unions, `&`, and `Partial` / `Omit`. We use `interface` only when we must *merge into* an existing declaration (like `ImportMetaEnv`).

**Discriminated union in action:**
```ts
const auth = useAuth()
auth.user.name                                   // ❌ error: user might be null
if (auth.status === 'authenticated') auth.user.name   // ✅ TS knows user is a User here
```

---

## Step 8: AuthProvider: stay logged in after a reload

**Problem:** `user` lived in `LoginPage`'s state, which is lost on reload and visible only to that page, even though the httpOnly cookie was still valid.
**Fix:** keep the auth state in a **Context**, and on every page load ask the server **"who am I?"** (`GET /api/auth/me`). The browser sends the cookie automatically.

### Files (in build order)
| # | File | Job |
|---|------|-----|
| 1 | `features/auth/api/authApi.ts` → `getMe(signal?)` | `GET /api/auth/me` → the user, or a 401 `ApiError` |
| 2 | `features/auth/useAuth.ts` | `AuthState` (discriminated union), `AuthContext`, the `useAuth()` hook |
| 3 | `features/auth/AuthProvider.tsx` | Holds the state, checks `/me` on start, provides `login()` |
| 4 | `main.tsx` | `<ThemeProvider><AuthProvider><App/></AuthProvider></ThemeProvider>` |
| 5 | `AuthProvider` + `ThemeProvider` | `useMemo` / `useCallback` for a stable context value (SonarQube S6481) |
| 6 | `App.tsx`, `pages/LoginPage.tsx`, `pages/HomePage.tsx`, `components/AppHeader.tsx` | `App` picks the screen from `status`. Login uses `useAuth().login()` |

### The flow
```
page load → AuthProvider: status 'loading' → App shows "Checking your session…"
          → useEffect → getMe()  (cookie sent automatically)
               ├─ 200 { user } → 'authenticated'   → App shows <HomePage user=…/>
               └─ 401          → 'unauthenticated' → App shows <LoginPage/>

login form → useAuth().login(values) → POST /login → setState('authenticated')
          → App re-renders → <HomePage/>   (no "navigate" needed: the screen follows the state)
```

### Concepts
**1. Discriminated union for state** (`useAuth.ts`)
```ts
type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated'; user: null }
```
Impossible states ("authenticated without a user") can't be written. In `App`, after `if (auth.status === 'authenticated')`, TS knows `auth.user` is a `User`, so `HomePage` gets it as a **non-null prop**.

**2. Why a `'loading'` status?** On load we *don't know yet*. Without it, logged-in users would see the login page flash for a second (or up to a minute while Render wakes up).

**3. Fetching in `useEffect`, with cleanup** (`AuthProvider.tsx`)
- `[]` = run once when the provider mounts.
- The effect function can't be `async` (it must return nothing or a cleanup), so we use `.then().catch()`.
- **StrictMode runs effects twice in dev** (mount → cleanup → mount). Cleanup = `controller.abort()` cancels the first `/me`. The `catch` ignores it (`if (controller.signal.aborted) return`). In DevTools → Network you'll see one `/me` **(canceled)** and one 200/401.

**4. The provider's `login()` wraps the API's `login()`**
It calls the API, then **saves** the user in the shared state. If the API throws, the `ApiError` passes through to `LoginPage`, which still shows the server's message.
`import { login as loginRequest }` renames an import to avoid a name clash.

**5. `useMemo` + `useCallback`: a stable context value**
`value={{ ...state, login }}` creates a **new object every render**. React compares context values by **reference**, so every `useAuth()` user would re-render for nothing.
- `useMemo(() => ({ ...state, login }), [state, login])`: the same object until `state` changes.
- `useCallback(fn, [])`: the same function every render (otherwise `login` changes and spoils the `useMemo`).
Applied to `ThemeProvider` too.

**6. `App` as a "switch"**
Three `if`/`return`s pick the screen. Step 9 (routing) will turn this into URLs (`/login`, `/`), with a "protected route" doing the same status check.

### Also fixed
- Review item **#6**: "New to {appName}?" uses `env.appName`.
- `AppHeader` is shared by the login page, the home page and the loading screen (it was copied before).

### Try it
1. `npm run dev` → you briefly see **"Checking your session…"**, then the login page.
2. Log in with a real account → the home card appears **without any navigation code**.
3. **Reload** → "Checking your session…" → you're **still logged in** 🎉.
4. DevTools → Network: find the two `/me` requests (the first **canceled** by the StrictMode cleanup).
5. To "log out" for now (a real logout is step 13): DevTools → Application → Cookies → delete `token` and `refresh_token`, then reload.
6. Wait 15+ minutes and reload: the access cookie has expired, so you'll see the login page. Step 12 (silent refresh) fixes that using `refresh_token`.

### Check yourself
1. Why does the app need a `'loading'` status?
2. Why can't the function passed to `useEffect` be `async`?
3. What would go wrong without `controller.abort()` in the cleanup?
4. After a successful login, what makes the screen change to `HomePage`?
5. Why `useMemo` for the provider's `value`?
6. Why can `HomePage` take `user: User` (not `User | null`)?

---

## Step 9: routing + protected routes (React Router 8)

**Goal:** real URLs (`/`, `/login`, `/signup`), pages only logged-in users can see, and no full reloads between pages.
Same version and style as your JS-concepts routing milestone: `<BrowserRouter>` + `<Routes>`.

### Files
| File | Job |
|---|---|
| `src/main.tsx` | `<BrowserRouter>` wraps everything (outside the providers, so auth code can use router tools later) |
| `src/App.tsx` | Just `<AppRoutes />` |
| `src/routes/AppRoutes.tsx` | **Only** the URL → page map |
| `src/routes/guards.tsx` | `ProtectedRoute`, `GuestRoute`, `redirectTarget()`, the "Checking your session…" screen |
| `src/features/auth/useAuth.ts` | + `useCurrentUser()`: the user is guaranteed on protected pages |
| `src/pages/SignupPage.tsx`, `NotFoundPage.tsx` | New pages (signup is a placeholder until step 10) |
| `LoginPage.tsx`, `AppHeader.tsx` | `<a href>` → `<Link to>`. The logo links home |

### The route map
```tsx
<Routes>
  <Route element={<ProtectedRoute />}>           ← layout route: no path, just a wrapper
    <Route path="/" element={<HomePage />} />
  </Route>
  <Route element={<GuestRoute />}>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
  </Route>
  <Route path="*" element={<NotFoundPage />} />  ← anything else
</Routes>
```
- **Layout route** = `element` without `path`. It adds nothing to the URL, but its element runs **first** for every child. That's why the guards go there.
- **`<Outlet />`** = "show the matching child route here".
- To protect a new page later (`/rides`), just put it **inside** the `ProtectedRoute` group.

### The guards
| | loading | logged in | logged out |
|---|---|---|---|
| `ProtectedRoute` | spinner | `<Outlet/>` (the page) | `<Navigate to="/login" replace state={{ from: location }} />` |
| `GuestRoute` | spinner | `<Navigate to={redirectTarget(state)} replace />` | `<Outlet/>` |
- **`replace`** swaps the history entry instead of adding one, so **Back** doesn't bounce you into the guard again.
- **No navigation code in `LoginPage`:** login sets the status to `authenticated` → `GuestRoute` re-renders → redirects. The screen follows the state (step 8's idea, now with URLs).

### Return to the page you wanted
- **`useLocation()`** = where you are now (`pathname`, `search`, `hash`, `state`).
- **Location `state`** = invisible data attached to a navigation (not in the URL). `ProtectedRoute` puts `{ from: location }` there. `GuestRoute` reads it after login.
- **`redirectTarget()`** treats `state` as `unknown` and checks it. Only in-app paths are allowed (`/rides` ✅, `//evil.com` / `https://evil.com` → `/`). This blocks an **open redirect**, where the login page could be abused to send users to another website.

### `<a href>` vs `<Link to>`
| `<a href="/signup">` | `<Link to="/signup">` |
|---|---|
| Reloads the whole app, the providers restart, `/me` is asked again | Only the URL + page change. State is kept and it's instant |
`<Link>` still renders a real `<a>` (right-click → new tab, keyboard and screen readers work). Use `<a>` only for **other websites**.

### SPA fallback
Opening `/signup` directly makes the server send `index.html`, and then the router picks the page. Vite's dev server does this automatically. **When deploying**, the host needs a "rewrite everything to `index.html`" rule, or direct visits give the host's own 404.

### `useCurrentUser()`
Protected pages call `const user = useCurrentUser()`: always a `User`, never `null`, because the guard already checked. Used outside a protected route by mistake → a clear error.

### Try it
1. Logged out → open `/` → you're sent to `/login` (watch the address bar).
2. Logged out → open `/?welcome=yes` → log in → you're back on `/?welcome=yes` (the `state.from` trick).
3. Logged in → open `/login` → you're sent to `/`.
4. Click "Create an account" → `/signup`, **without** "Checking your session…" (no reload). Click the logo → home.
5. Open `/nope` → the 404 page → "Go home".
6. After any redirect, press **Back**: no bouncing (that's `replace`).

### Check yourself
1. What is a layout route, and why do the guards go there?
2. What does `<Outlet />` render?
3. Why `replace` on `<Navigate>`?
4. How does the app remember the page you wanted before logging in? Why doesn't it appear in the URL?
5. Why does `redirectTarget()` reject `//evil.com`?
6. Why is `<Link>` better than `<a href>` for pages inside the app?

---

## Step 10: signup

**Goal:** create an account from the app (5 fields + a role choice). The backend's rules are checked in the browser, and anything the server rejects shows in the red box.

### Files (in build order)
| # | File | Job |
|---|------|-----|
| 1 | `services/api/ApiError.ts`, `axiosClient.ts` | Understand 400 `details` → a readable `message` ("Phone: …") |
| 2 | `features/auth/types.ts`, `lib/validation.ts` | `SIGNUP_ROLES` (`as const`), `SignupValues`, `validateSignup()`. The email rule is shared with login (`emailError()`) |
| 3 | `api/authApi.ts`, `useAuth.ts`, `AuthProvider.tsx` | `signup()`: API call, then status `authenticated` (signup sets the same cookies as login) |
| 4 | `components/SignupForm.tsx` | 5 fields + RIDER/DRIVER radio cards |
| 5 | *(removed to keep it simple, see concept 5)* | |
| 6 | `pages/SignupPage.tsx` | Wires it up: `useAuth().signup()`, loading, errors |

### The backend's rules (from one deliberately invalid signup)
| Field | Rule | Server's message |
|---|---|---|
| name | required | name is required |
| email | valid email | Invalid email |
| phone | **10-digit Indian mobile** (starts with 6–9) | enter a valid 10-digit Indian mobile number |
| password | **≥ 8 characters** | password must be at least 8 characters |
| role | `DRIVER` or `RIDER` | Invalid enum value… |
⚠️ **5 signups per hour per IP, and failed ones count too.** That's a big reason the browser checks first.

### Two layers of validation
| | Browser (`validation.ts`) | Server |
|---|---|---|
| When | Instantly, no request | After sending |
| Messages | Ours, under each field | The backend's, in the red box |
| Can be bypassed? | Yes | **No**: the real protection |

### Concepts
**1. `as const` list → type** (the "instead of enum" pattern)
```ts
export const SIGNUP_ROLES = ['RIDER', 'DRIVER'] as const   // .map() draws the role cards
export type SignupRole = (typeof SIGNUP_ROLES)[number]    // 'RIDER' | 'DRIVER'
```
**2. `Record<SignupRole, …>`**: `ROLE_OPTIONS` must have an entry **for every role**, or TS complains.

**3. Radio cards (accessible)**
- Real `<input type="radio">` (hidden with `sr-only`) inside a `<label>`: clicking the card selects it, and arrow keys move between options.
- `<fieldset>` + `<legend>`: screen readers announce the question. `disabled` on the fieldset disables both cards.
- Tailwind **`has-checked:`** = "style me when the radio inside me is checked". Pure CSS, no state.

**4. A generic `update<K>()`**
`update<K extends keyof SignupValues>(field: K, value: SignupValues[K])`: `update('role', 'DRIVER')` ✅, `update('role', 'PILOT')` ❌. TS checks each field's own type.

**5. Errors: the simple rule (the same as login)**
| Kind of error | Where it shows |
|---|---|
| **Our** check (empty, short password, wrong phone…) | Under the field |
| **Anything the server says** (409 email taken, 429, a 400 our check missed…) | One red box at the top, with the server's message |
Thanks to action 1, even a 400 has a readable message, e.g. *"Phone: enter a valid 10-digit Indian mobile number"*.
(We first built a version that also put server errors under each field. It was more code than it was worth, so we removed it. Later we also removed `ApiError.fieldErrors`, since nothing used it.)

**6. Signup = logged in**
The server sets the cookies on 201, so the provider sets `authenticated` → `GuestRoute` → `/`. **No navigation code in the page.** The new user has `phoneVerified: false` → step 11.

**Nice input details:** `inputMode="numeric"` (number keypad on phones), `maxLength={10}`, `autoComplete="tel-national"`, `autoComplete="new-password"` (password managers suggest a strong one).

### Try it
1. Go to `/signup` (restart `npm run dev` if the page still shows "coming soon").
2. Click **Create account** empty: four messages, and the cursor jumps to **Full name**.
3. Phone `5876543210` → "Enter a 10-digit mobile number…". Password `1234567` → too short.
4. Click the role cards, then use **Tab** + **arrow keys**: the highlight follows.
5. Sign up with an email you've already used → the server's **409** message in the red box.
6. A real signup (⚠️ 5 per hour) → after step 11 you land on `/verify-phone`. You should receive an SMS code, keep it for step 11!

### Check yourself
1. Why check in the browser if the server checks anyway? (Two reasons.)
2. Where does one of our errors show, and where does a server error show?
3. What does `has-checked:` do, and why don't we need state for the highlight?
4. After a successful signup, what sends the user to `/`?

---

## Step 11: verify phone

**Goal:** a new account has `phoneVerified: false`, and most API routes answer 403 `PhoneNotVerifiedError` until the SMS code is entered. This step adds the page that takes the code, a resend button with a countdown, and redirects so unverified users can't skip it.

### Files (in build order)
| # | File | Job |
|---|------|-----|
| 1 | `features/auth/api/authApi.ts` | `verifyPhone(code)` → the updated `User`. `resendCode()` → `{ message, resendAfterSeconds }` |
| 2 | `useAuth.ts`, `AuthProvider.tsx` | `verifyPhone` added to the context: it saves the verified user |
| 3 | `pages/VerifyPhonePage.tsx`, `routes/AppRoutes.tsx` | The page + the `/verify-phone` route (inside `ProtectedRoute`) |
| 4 | `routes/guards.tsx` | Unverified → `/verify-phone`. Verified on `/verify-phone` → `/` |

### The concepts

**1. What goes in the provider, and what doesn't**
Ask: *"Do other pages need to know this happened?"*
| Action | Changes the user? | Where |
|---|---|---|
| `login`, `signup` | Yes: logged out → logged in | `useAuth` |
| `verifyPhone` | Yes: `phoneVerified` false → true | `useAuth` |
| `resendCode` | No, it only sends an SMS. The result matters only to this page | Called directly from the page |

**2. A countdown with `useEffect` + `setTimeout`**
```ts
useEffect(() => {
  if (secondsLeft <= 0) return
  const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
  return () => clearTimeout(timer)
}, [secondsLeft])
```
- Each tick changes `secondsLeft`, which runs the effect again, which schedules the next tick. At 0 it stops.
- **Cleanup** (`clearTimeout`): leave the page and no timer is left running.
- `setSecondsLeft((s) => s - 1)`: the **updater form** uses the latest value, not a stale one.
- The server decides the wait (`resendAfterSeconds`), so we don't hardcode 30.

**3. One-time-code input**
`inputMode="numeric"` (number keypad), `autoComplete="one-time-code"` (phones offer the SMS code above the keyboard), `maxLength={6}`, and `onChange` removes non-digits: `value.replace(/\D/g, '')`.

**4. Redirects in one place (`ProtectedRoute`)**
```tsx
const onVerifyPage = location.pathname === '/verify-phone'
if (!auth.user.phoneVerified && !onVerifyPage) return <Navigate to="/verify-phone" replace />
if (auth.user.phoneVerified && onVerifyPage) return <Navigate to="/" replace />
```
- The `onVerifyPage` check stops `/verify-phone` from redirecting to **itself** forever.
- `auth.user` needs no `?.`: after the `status` checks, the discriminated union tells TS the user exists.
- Every future protected page (`/rides`, `/profile`…) is covered automatically.

**5. No `navigate()` after verifying**
After a successful verify, the provider saves the user with `phoneVerified: true`, and the guard's second rule sends you to `/`. So the page doesn't navigate itself (the same "change the state, the routes follow" idea as signup and logout). An unverified user can still leave with the **Log out** link under the card.

### Flow at a glance
```
Sign up → phoneVerified: false → any protected page → /verify-phone
Enter code → verifyPhone() → provider saves the user (phoneVerified: true) → /
Verified user opens /verify-phone → /
```

### Try it
1. Log in with an unverified account and open `/`: you land on `/verify-phone`.
2. Click **Verify** with an empty box → "Enter the 6-digit code from the SMS". Letters can't be typed.
3. A wrong code → the server's message in the red box.
4. **Resend code** → a grey notice and "Resend in 30s… 29s…". (⚠️ Resend is rate-limited.)
5. The right code → home. Now type `/verify-phone` → sent back to `/`.

### Check yourself
1. Why is `verifyPhone` in `useAuth` but `resendCode` isn't?
2. What makes the countdown keep going, and what stops it?
3. Why is the cleanup function needed in the countdown effect?
4. Without the `onVerifyPage` check, what would happen on `/verify-phone`?

---

## Step 12: silent refresh on 401

**Goal:** the `token` cookie lasts only 15 minutes, but `refresh_token` lasts 7 days. When a request gets 401 because `token` expired, swap the refresh token for a new one and **resend the request**, without the user noticing.

### The endpoint: `POST /api/auth/refresh`
| | |
|---|---|
| Sends | No body. The `refresh_token` cookie is the credential (the browser attaches it). CSRF header: added by our request interceptor |
| 200 | A new `token` **and** a new `refresh_token`, plus `{ user }` |
| 401 | Missing, expired or reused refresh token. The server also deletes both cookies |
| 429 | More than 30 refreshes per minute |

⚠️ **A refresh token works only once.** If a used one is sent again (after a few seconds), the server treats it as stolen and revokes **all** of the user's sessions. So parallel requests must never refresh separately.

### Files
| File | Job |
|---|---|
| `services/api/axiosClient.ts` | `shouldRefresh()`, `refreshSession()`, the retry in the response interceptor |
| `services/api/__tests__/client.test.ts` | 5 tests with a fake server that answers by URL |

### The concepts

**1. An interceptor can resend the request**
```ts
async (error: unknown) => {
  if (!shouldRefresh(error)) throw toApiError(error)
  error.config._retried = true
  try {
    await refreshSession()
  } catch {
    throw toApiError(error)            // refresh failed → the ORIGINAL 401
  }
  return http.request(error.config)    // same request again, now with the new cookie
}
```
Whatever the interceptor **returns** becomes the result of the original call, so the page just gets its data.

**2. When NOT to refresh (`shouldRefresh`)**
- Not a 401 → no.
- `/login`, `/signup`, `/refresh`, `/logout` → no. A 401 on `/login` means "wrong password", and a 401 on `/refresh` means the refresh failed.
- Already retried once (`_retried`) → no. Otherwise "401 → refresh → 401 → refresh…" would loop forever.
- `error is AxiosError & {…}` is a **type guard**: after `if (!shouldRefresh(error))` TS knows `error.config` exists.

**3. One shared refresh: a Promise kept in a variable**
```ts
let refreshing: Promise<void> | null = null

function refreshSession() {
  refreshing ??= http.post('/api/auth/refresh').then(() => undefined).finally(() => { refreshing = null })
  return refreshing
}
```
- `a ??= b`: "if `a` is null, set it to `b`".
- 1st 401 → starts the refresh and saves its Promise. 2nd and 3rd 401 → find it and `await` the **same** Promise.
- `.finally` clears it, so the next expiry (15 min later) can refresh again.
- A Promise can be awaited by **many** callers. They all get the same result.

**4. A free bonus: reopening the app**
Open the app after an hour: `GET /me` → 401 → refresh → `GET /me` again → still logged in. Step 8's code didn't change at all.

### Flow at a glance
```
GET /rides → 401
   └─ /rides is not excluded, not retried yet → refreshSession()
         ├─ 200 → resend GET /rides → data to the page ✅
         └─ 401 → the original 401 → ApiError (logged out)
```

### Compared with bear-portal-new (`baseApiService.ts`)
The core is the same: a `_retry` flag, an excluded-URL list, `refreshPromise ??= …finally(() => null)`, and `api.request(error.config)`. Differences:
- When the refresh fails, they **clear the session and redirect to `/login`**. We just return the error for now; step 13 handles it.
- Production extras we don't need yet: `axios-retry` for 5xx, a circuit breaker, Sentry, special 402/403 pages.
- They use a class with one instance (`getInstance()`); we use a module (also one shared instance).
- They match URLs with `includes()`; we compare the exact path.

### Known gap (step 13)
If the refresh fails **while you use the app**, that request shows an error, but the header still looks logged in until you reload. The fix: tell the `AuthProvider` "the session ended" and go to `/login`.

### Try it
1. Restart `npm run dev` and log in.
2. DevTools → **Application** → **Cookies** → delete **`token`** only (keep `refresh_token`).
3. Reload → still logged in. **Network** tab: `me` 401 → `refresh` 200 → `me` 200.
4. Now delete **both** cookies and reload → `me` 401 → `refresh` 401 → the login page.
5. `npm test`: the "silent refresh on 401" tests show each case.

### Check yourself
1. Why must a wrong password on `/login` not trigger a refresh?
2. What would happen without the `_retried` flag if the server kept answering 401?
3. Three requests get 401 at the same time. How many refreshes are sent, and why does it matter for this backend?
4. Why does `.finally()` set `refreshing` back to `null`?

---

## Step 13: logout, session ended, profile

**Goal:** finish auth. Log out from a menu, notice when the session dies mid-use, and let the user change their name.

### Files
| # | File | Job |
|---|------|-----|
| 1 | `authApi.ts`, `useAuth.ts`, `AuthProvider.tsx` | `logout()` → `POST /logout`. `updateName(name)` → `PATCH /me` |
| 2 | `services/api/axiosClient.ts` | `setSessionExpiredHandler()`: called when the silent refresh fails |
| 3 | `pages/ProfilePage.tsx` + `/profile` route | Change your name; email, phone and role are read-only |

### The concepts

**1. Change the state, the routes follow**
`logout` only does `setState({ status: 'unauthenticated' })`. `ProtectedRoute` sees it and redirects to `/login`. There's no `navigate()` call, the same as signup and verify.
```ts
await logoutRequest().catch(() => undefined)   // even offline: the user asked to leave
setState({ status: 'unauthenticated', user: null })
```

**2. A callback lets non-React code talk to React**
`axiosClient.ts` knows *when* the refresh failed but can't call `setState`. The provider hands it a function:
```tsx
useEffect(() => {
  setSessionExpiredHandler(() => setState({ status: 'unauthenticated', user: null }))
  return () => setSessionExpiredHandler(null)   // cleanup: no calls after unmount
}, [])
```
`onSessionExpired?.()` only calls it if it's set. bear-portal-new does a full-page `location.replace('/login')`; ours just changes state (no reload, and it remembers the page in `from`).

**3. A form that starts filled in**
`useState(user.name)`: the initial value is used **only on the first render**. Then the input belongs to the form.

**4. Derived values instead of extra state**
```ts
const trimmed = name.trim()
const nameError = trimmed ? undefined : 'Name is required'
const hasChanged = trimmed !== user.name   // Save is disabled until true
```

**5. One save updates every screen.** `updateName` stores the returned user in the provider, so the sidebar, the menu and the Dashboard show the new name at once.

### Try it
1. Profile → change your name → **Save changes** → the sidebar name updates.
2. Clear the name → "Name is required", and Save is disabled.
3. Delete **both** cookies in DevTools (don't reload), then click Save → `/login`. Log in → back on `/profile`.
4. Sidebar user menu → **Log out** → `/login`, and both cookies are gone.

### Check yourself
1. Why does logout not need `navigate('/login')`?
2. Why can't `axiosClient.ts` call `setState` itself, and how does it tell the app?
3. If `user.name` changes elsewhere, does `useState(user.name)` update the input? Why not?

---

## Step 14: dashboard layout (like bear-portal-new)

**Goal:** the same structure as the portal: a collapsible sidebar, a top bar, and pages made of a header plus bordered sections. Auth pages (login, signup, verify) keep their centered card.

### Files
| File | Job |
|------|-----|
| `components/ui/sidebar.tsx` (+ sheet, tooltip, separator, skeleton, avatar, switch) | Added with `npx shadcn@latest add sidebar avatar switch` |
| `hooks/use-mobile.ts` | "Is the screen narrower than 768px?", rewritten with `useSyncExternalStore` |
| `layouts/DashboardLayout.tsx` | `DashboardLayout`, `AppSidebar` (nav), `NavUser` (footer menu) |
| `components/page.tsx` | `PageHeader`, `SectionCard`, `DetailRow`, `StatusBadge` |
| `routes/AppRoutes.tsx` | Home + Profile nested inside `DashboardLayout` |
| `main.tsx` | `<TooltipProvider>` (tooltips on the collapsed sidebar icons) |

### The concepts

**1. A nested layout route**
```tsx
<Route element={<ProtectedRoute />}>          {/* 1. logged in? */}
  <Route path="/verify-phone" element={<VerifyPhonePage />} />
  <Route element={<DashboardLayout />}>       {/* 2. sidebar + top bar */}
    <Route path="/" element={<HomePage />} />  {/* 3. the page, in <Outlet /> */}
    <Route path="/profile" element={<ProfilePage />} />
  </Route>
</Route>
```
A route with only `element` (no `path`) wraps its children. Each layer renders an `<Outlet />` where the next one goes. The pages no longer draw a header themselves.

**2. Navigation from a config array**
`NAV_ITEMS = [{ to, label, Icon }]` → `.map()` → one `SidebarMenuButton` each. To add "Find a ride" later: one new line. `isActive={pathname === to}` gives the dark highlight.

**3. `asChild` (Radix Slot)**
`<SidebarMenuButton asChild><Link to="/">…</Link></SidebarMenuButton>`: the button's styles and behaviour go onto **its child**, so the result is a real `<a>` link that looks like a menu button.

**4. `useSidebar()`: a context from shadcn**
`SidebarProvider` holds "open / collapsed / mobile". Any component inside can read it: the menu opens to the **right** when the sidebar is collapsed and **upward** otherwise, and on phones a nav click closes the slide-in panel. This is the same pattern as our `useAuth` and `useTheme`.

**5. `useSyncExternalStore`: reading something outside React**
```ts
useSyncExternalStore(
  subscribe,                                       // how to listen for changes
  () => window.matchMedia(MOBILE_QUERY).matches,   // the current value
  () => false,                                     // value during server render
)
```
shadcn's version copied the value into state inside an effect (lint warns: an extra render). This hook is React's built-in way to read browser values like screen size or online status.

**6. Small layout components with `children`**
`<SectionCard title Icon aside>…</SectionCard>`: the frame (border, grey header row, icon tile) is written once, and each page fills in the inside. `Icon` is passed as a **component** (`Icon={IdCard}`) and rendered as `<Icon />`.

### Compared with bear-portal-new
Same building blocks: `SidebarProvider`, `Sidebar collapsible="icon"`, `SidebarTrigger`, a footer `DropdownMenu` with initials, a theme `Switch` and Logout. Theirs adds collapsible nav sections, permissions per item, an organization switcher, notifications and a route loader.

### Try it
1. Log in → the Dashboard with the sidebar.
2. Click ◫ (top left), or press **⌘B**: the sidebar collapses to icons. Hover an icon to see a tooltip.
3. Click your name (bottom left) → My Profile, the theme switch and Log out.
4. Make the window narrow (< 768px): the sidebar becomes a slide-in panel opened by ◫.

### Check yourself
1. Which component renders the `<Outlet />` that HomePage appears in?
2. Why does the verify-phone page sit outside `DashboardLayout` but inside `ProtectedRoute`?
3. What does `asChild` change about the rendered HTML?
4. Why is `useSyncExternalStore` better than `useState` + `useEffect` for screen size?

## Step 15: color for badges and icons (from bear-portal-new)

The app looked black and white because our theme is shadcn's default grey: `--primary` in `src/index.css` has no hue at all. bear-portal-new sets it to a pine green, and adds colored badges.

**1. Badges with a `tone` prop**
`<StatusBadge tone="green">` picks its colors from a small map (`TONES` in `src/components/page.tsx`). The colors are copied from bear-portal-new's Badge: a light background, darker text, and a `dark:` version for dark mode. No tone means `neutral`, the old grey look.

**2. One color per role**
`<RoleBadge role="DRIVER" />` looks up `ROLE_TONES` (ADMIN purple, DRIVER blue, RIDER green), so the Dashboard and the Users table always agree. `Record<Role, …>` makes TypeScript complain if a new role is added without a color.

**3. Verified as a badge**
The Users table shows green ✓ Verified or amber 🕒 Pending. bear-portal-new colors Active/Pending the same way (green / amber).

**4. Tinted icon tiles**
`SectionCard`'s icon box uses `bg-primary/10 text-primary`: the primary color at 10% opacity behind, the full color on the icon. It reads from the theme, so it turns properly colored once `--primary` gets a real color.

**5. A project skill: `.claude/skills/shadcn/SKILL.md`**
A skill is a set of instructions Claude loads for a kind of task. This one, adapted from bear-portal-new, tells Claude to build UI with shadcn components and theme colors (`bg-primary`, not `bg-blue-500`), `gap-*` instead of `space-y-*`, `size-*` for square things, and accessible dialogs. Because it lives in the repo, it applies to anyone working on this project.

### Check yourself
1. Why put the role → color map in one place instead of writing colors in each page?
2. What does the `/10` in `bg-primary/10` mean?
3. Why will the icon tiles change color by themselves when we pick a brand color?
