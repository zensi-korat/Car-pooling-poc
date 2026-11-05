# Pool: car-pooling web app

A learn-while-building project. The developer is new to React. Explanations matter as much as the code.
Reference project for patterns and standards: `~/Bear REPOS/bear-portal-new` (compare with it when unsure).

## Git: hands off

- **Never run a git command that changes anything**: no `commit`, `add`, `rm`, `mv`, `checkout`, `switch`,
  `branch`, `stash`, `reset`, `restore`, `merge`, `rebase`, `cherry-pick`, `tag`, `push`, `pull`.
  The developer does all of these themselves.
- Read-only commands are fine: `git status`, `git diff`, `git log`, `git show`.
- To move or rename files, use plain `mv`. Git will see the rename when the developer stages it.

## How to work with the developer

- Explain every action **before** doing it, in plain, simple words. Work in small steps.
- Build the simplest working version. Offer refinements, but don't build them unasked.
- No teaching comments in components. Explanations go in the chat and the `LEARN*.md` files.
  Short comments that explain *why* (a server rule, a gotcha) are fine.
- Show the server's own error messages (`getErrorMessage`, `FormAlert`), not invented ones.
- Install packages with `npx -y npm@11 install <pkg>`.
- Never stop or restart the developer's `npm run dev`.
- Config and env values go in `.env` (read through `src/config/env.ts`).

## Stack

Vite, React 19, TypeScript, Tailwind v4, shadcn/ui (radix-nova, lucide icons), axios, React Router,
TanStack Query v5, Zod v4, Vitest, oxlint, Prettier, Husky + lint-staged.
Backend: https://ride-sharing-poc-76s7.onrender.com through the Vite proxy (`/api/...`), httpOnly cookie auth.

## Commands

- `npm run check`: typecheck + lint + format check + tests. **Run it before saying a task is done.**
- `npm run build`, `npm test`, `npm run lint`, `npm run format`.

## Folder structure

```
src/
  features/
    auth/                  login, signup, session (shared by every role)
    admin/<module>/        admin-only modules: users, rides, vehicles, audit-log
    driver/<module>/       driver-only modules (coming next)
    rider/<module>/        rider-only modules (coming next)
    shared/<module>/       domain pieces used by MORE than one role (create it when that first happens)
  pages/
    admin/                 Admin*Page.tsx
    driver/  rider/        one folder per role; public/auth pages stay in pages/
  components/              shared UI: page.tsx (PageHeader, ListTable, TwoLines, badges…), form.tsx, DateRangeFilter
  components/ui/           shadcn components (generated: don't hand-edit unless needed)
  hooks/                   shared hooks: useListParams, useDebouncedValue…
  lib/                     shared helpers: filters, dates, pagination, text, queryClient
  services/api/            the HTTP client: api(), ApiError, getErrorMessage, pageSchema/Page
  routes/                  AppRoutes + guards (one guard per role, e.g. AdminRoute)
  layouts/                 DashboardLayout (sidebar NAV_ITEMS, adminOnly flags)
```

Every module has the same inside:

```
<module>/
  api/<module>Schema.ts    Zod schemas + types (z.infer), and request param types
  api/<module>Api.ts       the request functions; nothing else calls URLs
  components/              the module's UI (PascalCase .tsx files)
  hooks/                   TanStack Query hooks (useXxx.ts)
  lib/                     helpers + __tests__/
```

### Rules for keeping roles separate

- A module imports only from **itself** or from **shared places** (`@/components`, `@/hooks`, `@/lib`,
  `@/services/api`, `@/features/auth`, `@/features/shared`).
- **Never import from another role's folder** (driver → admin, admin → rider, …). If two roles need the same
  thing (e.g. the base `rideSchema`), move it to `features/shared/<module>/` and import from there in both.
- Admin modules call `/api/admin/*` endpoints. Role pages sit behind their own route guard, and sidebar
  items are flagged per role.
- Inside a module, use relative imports (`../api/…`). Between folders, use the `@/` alias.

## Zod

- Every API **response** is described with Zod in `api/<module>Schema.ts`. Types come from
  `z.infer<typeof xSchema>`; never write the same shape twice by hand.
- Pass the schema to `api()`: `api('/api/…', { params, signal, schema: xSchema })`. It checks the response;
  a wrong shape becomes an `ApiError` ('InvalidResponseError') with a friendly message, plus the details in the console.
- Paginated lists: `pageSchema(itemSchema)` from `@/services/api`, built once at module level.
- Admin variants extend the base: `adminRideSchema = rideSchema.extend({ driver: … })`.
- Enums: `z.enum([...])`. Use `xSchema.options` for dropdown lists and URL readers (no second hand-written list).
- Swagger mapping: `enum` → `z.enum`; `format: date(-time)` → `z.string()`; nullable → `.nullable()`;
  free-form object → `z.record(z.string(), z.unknown())`; fields only described in text → add them after
  checking real data. Always check a **real response**, not Swagger's example.
- Zod drops fields the schema doesn't list, so add a field to the schema before using it.
- Form rules are Zod schemas too (see `auth/api/authSchema.ts` + `auth/lib/validation.ts`).
- Request params and bodies we build ourselves stay plain TS types (nothing to check at runtime).

## Data fetching (TanStack Query)

- Query keys: `['admin', '<list>', params]` (role first, so `invalidateQueries({ queryKey: ['admin'] })` refreshes them all).
- Lists use `placeholderData: keepPreviousData`, and `isPlaceholderData` shows the skeleton.
- Mutations live in their own hook (`useReviewVehicle`) and invalidate the affected keys in `onSettled`.
  Close dialogs or forms with the per-call `onSuccess`.

## Lists, filters and the URL

- Page, page size and filters live in the URL via `useListParams(readXxxFilters)`. Defaults are kept out of the URL.
- Each module's `lib/filters.ts` reads its filters **safely**: unknown values become `undefined`
  (use `readSearch` and `readDateRange` from `@/lib/filters`).
- Tables use the shared `ListTable` (skeleton / empty / rows + footer slot) and `TwoLines`.
- Dates: local-day helpers in `@/lib/dates` (never `toISOString()` for a calendar day). Display with
  `Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata' })`, and money with `Intl.NumberFormat` INR.

## UI: always shadcn + Tailwind

- Use shadcn components for all UI (`Button`, `Select`, `Dialog`, `Table`, `Badge`, `Skeleton`, `Calendar`, …).
  Add missing ones with `npx shadcn@latest add <name>`. No raw HTML controls when a shadcn one exists.
- Style only with Tailwind classes. No inline `style`, no CSS files besides `src/index.css` theme tokens.
- Semantic tokens (`bg-card`, `text-muted-foreground`, `border`); raw colours only inside variant or tone maps (`TONES`).
- `flex`/`grid` + `gap-*` (never `space-x/y-*`); `size-*` for equal width and height; `truncate`; `cn()` for conditional classes.
- Icons in buttons: `data-icon="inline-start|inline-end"`, no size classes. A loading button = `Loader2` spinner + `disabled`.
- `SelectItem` inside `SelectGroup`; dialogs always have a `DialogTitle`.
- Follow the project's `shadcn` skill (`.claude/skills/shadcn`) for everything visual.

## React and TypeScript style

- Props: `type XProps = Readonly<{ … }>`.
- Static config (headings, tone maps, option lists) goes **outside** components.
- Group small related components in one file. Keep pages thin: hooks + feature components.
- `Record<Union, X>` for exhaustive maps; `Record<string, X>` + `??` fallback when the server may add values.
- No `any`; use `unknown` and narrow it.
- Pure functions in `lib/` get Vitest tests in `__tests__/` next to them.
- Match the surrounding code: Prettier (no semicolons, single quotes, width 120), oxlint clean.
