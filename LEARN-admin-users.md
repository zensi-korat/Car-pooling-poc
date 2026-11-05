# Admin: list users (pagination + filters)

The learning notes for step 15. The main progress table is in [LEARN.md](LEARN.md).

**Goal:** an admin-only **Users** page that shows everyone who signed up, in pages of 25/50/100, with search, role and "joined" date filters. Everything lives in the URL, so reload, Back and shared links keep the exact view.

| Action | What we built | Main new idea |
|---|---|---|
| 0 | Read the endpoint in Swagger | Swagger → TypeScript |
| 1 | `listUsers()` + types | Query strings, generics (`Page<T>`) |
| 2 | TanStack Query | A cache of server data, keyed by name |
| 3 | `AdminRoute` + sidebar item | Role-based routing |
| 4 | The users table | One prop, three states |
| **5** | **Pagination** | **The URL as state** |
| **6** | **Filters + search** | **Debounce** |

---

## 0. Reading Swagger and mapping it to code

Open `https://ride-sharing-poc-76s7.onrender.com/api-docs/` → the **Admin** group → `GET /api/admin/users`.

| Swagger part | What it said | Where it went in our code |
|---|---|---|
| Tag | `Admin` | A feature folder: `src/features/admin/` |
| Method + path | `GET /api/admin/users` | `listUsers()` in `features/admin/api/adminApi.ts` |
| 🔒 lock icon | `cookieAuth` | Nothing to do: our cookies go automatically |
| Description | "newest first", "filters combine with AND", dates are `YYYY-MM-DD` in IST | Rules for the UI |
| Parameters (query) | `page` (default 1), `pageSize` (default 50, **max 200**), `role` (DRIVER/RIDER/ADMIN), `q`, `joinedFrom`, `joinedTo` | `ListUsersParams` type |
| 200 response | `{ items: User[], total, page, pageSize }` | `Page<T>` type |
| `$ref: #/components/schemas/User` | "the User shape, defined once at the bottom" | Our existing `User` type |
| Error responses | 400 bad filter, 403 not an admin | Already handled by `ApiError` |

**Tips**
- **"Try it out" → "Execute"** sends a real request. It's the quickest way to see real data.
- Under a response, switch **"Example Value" → "Schema"** to see types and limits.
- **The screen can be wrong.** For `q`, the page shows "Case-insensitive match on name", but the raw spec says "name, email or phone". A comma in the backend's docs cut the text. When something looks cut off, check the raw spec.
- **No sort parameter exists**, so the list is always newest first. Sorting in the browser would only sort the current page, which is misleading, so we left it out until the backend adds `sortBy` / `sortDir`.

---

## 1. Types and `listUsers()`

```ts
// features/admin/types.ts
export type Page<T> = { items: T[]; total: number; page: number; pageSize: number }

export type ListUsersParams = {
  page?: number
  pageSize?: number
  role?: Role
  q?: string
  joinedFrom?: string // YYYY-MM-DD
  joinedTo?: string
}

// features/admin/api/adminApi.ts
export function listUsers(params: ListUsersParams, signal?: AbortSignal): Promise<Page<User>> {
  return api<Page<User>>('/api/admin/users', { params, signal })
}
```

- **Generics:** `Page<T>`. `T` is a placeholder for "the row type". `Page<User>` means `items: User[]`. Later, rides will be `Page<Ride>`, from the same type.
- **Every parameter is optional (`?`)** because Swagger says `required: false`.
- **`params` → query string:** axios turns `{ page: 2, role: 'RIDER', q: undefined }` into `?page=2&role=RIDER`. It skips `undefined` and encodes special characters, so there's no string-building by hand.

### How TypeScript "matches" the server
TypeScript **doesn't check the server**. We write down a promise ("the server sends this shape"), and TypeScript checks that our code keeps that promise everywhere:
```
Swagger schema → Page<User> (written by hand)
  → api<Page<User>>()      ← we tell api() the shape
  → listUsers(): Promise<Page<User>>
  → useQuery infers data: Page<User> | undefined
  → data?.items: User[] → user.name autocompletes in the table
```
We wrote only two types by hand. Everything after that is **inferred**.

- **What it catches:** typos (`user.nmae`), wrong props (`users={data}` instead of `data?.items`), invalid roles (`'PILOT'`).
- **What it can't catch:** the backend renaming `total` to `count`. Types disappear when the code runs.
- **The fix, later:** **Zod**. It checks the real response at runtime and produces the type from the same schema. bear-portal-new does this in `authApiSchema.ts`.

---

## 2. TanStack Query

### Why use a library at all?
Server data is not like normal state:
- It lives on the server, and we only hold a **copy**.
- The copy can be **outdated**.
- Loading takes time and can **fail**.
- Many screens may want **the same** data.

Doing this by hand (`useState` + `useEffect` + `AbortController`, as in `AuthProvider` for `/me`) is fine once. For a list with pages and filters, it grows quickly. TanStack Query does that work for us.

### The idea: a cache of server data, with a name for each entry
```
['admin','users',{page:1,pageSize:50}] → { data, status: 'success', fetched 10 s ago }
['admin','users',{page:2,pageSize:50}] → { status: 'pending' }
```
You give it **two things**: the **key** (the name) and the **query function** (how to fetch). It handles loading, caching, errors and cancelling.

### The pieces
**`QueryClient` + `QueryClientProvider`** (`lib/queryClient.ts`, `main.tsx`): the cache, shared through Context, the same pattern as `AuthProvider`.
```ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) =>
        failureCount < 1 && (!(error instanceof ApiError) || error.status === 0 || error.status >= 500),
    },
  },
})
```
- **`staleTime: 30_000`**: data counts as fresh for 30 s. Showing the list again within 30 s means **no request**. After that, it shows the cached copy instantly and refreshes it in the background.
- **`retry`**: retry **once**, and only when trying again could help (no connection, or a 5xx). A 403 "not an admin" would get the same answer again.

**The hook** (`features/admin/hooks/useAdminUsers.ts`):
```ts
export function useAdminUsers(params: ListUsersParams) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: ({ signal }) => listUsers(params, signal),
    placeholderData: keepPreviousData,
  })
}
```
- **The key is an array, from general to specific.** Later, `invalidateQueries({ queryKey: ['admin','users'] })` refreshes **every** page and filter at once.
- **Everything the request depends on goes in the key.** If `params` were missing, page 2 would show page 1's cached data.
- **Objects in keys are compared by content**, so a new `{ page: 1 }` object each render is still the same key.
- **`signal`:** TanStack creates the `AbortController` for us and cancels requests we no longer need.
- **`keepPreviousData`:** while page 2 loads, page 1 stays on screen instead of an empty table.

**What `useQuery` gives back:**
| Value | Meaning |
|---|---|
| `isPending` | No data at all yet (first load) → skeleton |
| `isError`, `error` | It failed; `error` is our `ApiError` → show `error.message` |
| `data` | `Page<User>` |
| `isFetching` | A request is running now, even if old data is shown |
| `isPlaceholderData` | `data` is the **previous** page, kept while the new one loads |

**Clearing the cache on logout** (`AuthProvider`): `endSession()` calls `queryClient.clear()`, so the next person on this browser never sees the previous admin's list.

**Devtools:** the TanStack logo at the bottom right in `npm run dev`. It shows each key, its status (fresh, stale, fetching) and its data. It isn't included in production builds.

---

## 3. Admin-only access

```
ProtectedRoute         logged in + phone verified?
└─ DashboardLayout     sidebar + top bar
   └─ AdminRoute       has the ADMIN role?  no → "No access" (sidebar stays)
      └─ /admin/users
```
```ts
export function AdminRoute() {
  const user = useCurrentUser()
  if (!user.roles.includes('ADMIN')) return <NoAccess />
  return <Outlet />
}
```
The sidebar item has `adminOnly: true`, and the list is filtered before `.map()`:
```ts
const navItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)
```
⚠️ **Hiding is not security.** The real protection is the server's **403**. The guard only avoids showing a page that can't work.

---

## 4. The table: one prop, three states

```ts
let rows: ReactNode
if (!users) rows = <SkeletonRows />                                        // still loading
else if (users.length === 0) rows = <MessageRow>No users found.</MessageRow>  // empty
else rows = users.map((user) => <UserRow key={user.id} user={user} />)     // data
```
- `users={data?.items}`: `data` is `undefined` until the first answer, and `?.` passes `undefined` along, so you get skeletons.
- `key={user.id}`: a stable database id, not the array index, because rows move between pages.
- **Dates:** one `Intl.DateTimeFormat` with `timeZone: 'Asia/Kolkata'`, created once outside the component. The server's filters use IST days, so the "Joined" column matches them.
- `colSpan={HEADINGS.length}`: the message cell spans every column, even if columns are added later.

---

## 5. Pagination: the URL as state ⭐

### 5.1 The problem
The server might have **230 users**. Sending all of them at once is slow, so we ask for **pieces**, like the pages of a book:
```
pageSize = 50
Page 1 → users 1–50
Page 2 → users 51–100
...
Page 5 → users 201–230
```
We send two numbers, `page` and `pageSize`. The server sends back that piece **and the total**:
```json
{ "items": [ "...50 users..." ], "total": 230, "page": 2, "pageSize": 50 }
```

### 5.2 Where do we remember "which page am I on"?
**Option A, `useState`:**
```ts
const [page, setPage] = useState(1)
```
It works, but **reload → back to page 1**. The Back button does nothing, and you can't send someone a link to page 3.

**Option B, the URL (what we did):**
```
/admin/users?page=3&pageSize=25
            └───────┬──────────┘
            "search params": everything after ?
```
Now **reload keeps page 3**, **Back/Forward move between pages**, and **links can be shared**. The address bar is our state.

### 5.3 Reading the URL: `useSearchParams`
React Router's hook for the part after `?`. It looks like `useState` on purpose:
```ts
const [searchParams, setSearchParams] = useSearchParams()

searchParams.get('page')   // URL has ?page=3  → "3"
searchParams.get('page')   // no ?page in URL  → null
```
⚠️ **Two catches:**
1. Values are **always text**: `"3"`, not `3`.
2. **Anyone can type anything** into the URL: `?page=hello`, `?page=-5`, `?pageSize=9999`.

### 5.4 `lib/pagination.ts`: turning URL text into a safe number
```ts
export const PAGE_SIZES = [25, 50, 100] as const
export const DEFAULT_PAGE_SIZE = 50

export function readPage(value: string | null): number {
  const page = Number(value)                               // "3" → 3, "hello" → NaN
  return Number.isInteger(page) && page > 0 ? page : 1     // a proper page number? else 1
}

export function readPageSize(value: string | null): number {
  const size = Number(value)
  return PAGE_SIZES.some((allowed) => allowed === size) ? size : DEFAULT_PAGE_SIZE
}
```
| URL | `readPage` / `readPageSize` | Why |
|---|---|---|
| `?page=3` | 3 | Fine |
| *(nothing)* | 1 | Start at the beginning |
| `?page=hello` | 1 | Not a number |
| `?page=-2` | 1 | No negative pages |
| `?page=1.5` | 1 | No half pages |
| `?pageSize=25` | 25 | One of ours |
| `?pageSize=9999` | 50 | Not one of ours. The server would answer **400** (max 200). |

**Why a separate file?** They're plain functions, not components (a file that exports components *and* constants breaks Vite's instant hot reload). And the rides and audit-log tables will reuse them. The tests are in `lib/__tests__/pagination.test.ts`.

### 5.5 Using them in the page
```ts
const page = readPage(searchParams.get('page'))
const pageSize = readPageSize(searchParams.get('pageSize'))
const { data, isPlaceholderData } = useAdminUsers({ page, pageSize, ... })
```
`page` is **derived** from the URL on every render. There's no second copy in `useState` that could get out of sync.

### 5.6 Changing the page: the URL updater
```ts
function updateUrl(changes: Record<string, string | undefined>, replace = false) {
  setSearchParams(
    (params) => {
      for (const [key, value] of Object.entries(changes)) {
        if (value) params.set(key, value)   // write ?key=value
        else params.delete(key)             // empty → remove it from the URL
      }
      return params
    },
    { replace },
  )
}
```
In words: "For each change: if it has a value, put it in the URL; if it's empty, take it out."

The pagination buttons use it like this:
```ts
onPageChange={(next) => updateUrl({ page: next > 1 ? String(next) : undefined })}
onPageSizeChange={(size) =>
  updateUrl({ page: undefined, pageSize: size === DEFAULT_PAGE_SIZE ? undefined : String(size) })}
```
- **`String(next)`**: URLs hold text, so the number goes in as text.
- **Page 1 and size 50 are removed** because they're the defaults. `/admin/users` and `/admin/users?page=1&pageSize=50` mean the same thing, so we keep the short one.
- **Changing rows per page → back to page 1.** Say you were on page 5 with 50 per page (users 201–230) and switch to 100 per page. "Page 5" would then mean users 401–500, which don't exist.
- **`(params) => …`** is the updater form, like `setSecondsLeft((s) => s - 1)`. It builds on the latest URL.

### 5.7 The whole chain when you click "Next"
```
1. Click Next
2. updateUrl({ page: "3" })            → address bar: ?page=3
3. The URL changed                     → React renders the page again
4. readPage("3")                       → page = 3
5. useAdminUsers({ page: 3, ... })     → key ['admin','users',{page:3,...}]
6. TanStack: "I don't have this key"   → asks the server for page 3
     meanwhile keepPreviousData shows page 2, isPlaceholderData = true
     → the table fades (opacity-60) and the buttons are disabled
7. Page 3 arrives                      → the table shows it
```
**We never wrote "fetch page 3".** We only changed the URL; the rest follows: the URL changes, the number changes, the key changes, and TanStack fetches.

Going **back** to page 2 within 30 s? Its key is in the cache, so it shows **instantly**, with no request.

### 5.8 `TablePagination` (`components/page.tsx`): the footer
It **only displays and reports clicks**. It doesn't know about URLs or TanStack. The page owns the state and passes it down; the footer calls `onPageChange` / `onPageSizeChange` back up. That's why rides can reuse it later.

The math:
```ts
const totalPages = Math.max(1, Math.ceil(total / pageSize))   // 230 / 50 = 4.6 → round UP → 5
const from = total === 0 ? 0 : (page - 1) * pageSize + 1     // page 2 → (2-1)×50+1 = 51
const to = Math.min(page * pageSize, total)                   // page 2 → min(100, 230) = 100
```
- On the **last** page, `to = min(5×50, 230) = 230`. That's "Showing 201–230 of 230", not "…250". That's what `Math.min` is for.
- `Math.max(1, …)` means an empty list still says "Page 1 of 1", not "of 0".
- **Previous** is disabled on page 1. **Next** is disabled on the last page. Both are disabled while the next page loads.

**Accessibility:** the footer is a `<nav aria-label="Pagination">`, "Showing…" uses `aria-live` (announced after a click), the select has a real `<Label>`, and the table gets `aria-busy` while updating.

### 5.9 Try it yourself
1. `/admin/users?page=2&pageSize=25`: work out "Showing ___–___ of ___" on paper first, then check.
2. Click Next, then Previous: the second is instant. Look in the Devtools for two cache entries.
3. Reload: same page. Press Back: the previous page.
4. Type `?page=abc` → page 1. `?pageSize=9999` → 50.

---

## 6. Filters and search ⭐

### 6.1 What the server accepts
Filters **combine** ("AND"): role = DRIVER **and** joined in October.
| Filter | URL example | Meaning |
|---|---|---|
| Search | `?q=asha` | Name, email or phone contains "asha" (any case) |
| Role | `?role=DRIVER` | Only drivers |
| Joined from | `?joinedFrom=2026-10-01` | Joined on or after this day (IST) |
| Joined to | `?joinedTo=2026-10-31` | Joined on or before this day (IST) |

### 6.2 Same recipe as pagination
Filters also **live in the URL**. Changing a filter **only changes the URL**, and the same chain from 5.7 runs. Reload, Back and shared links keep the filters too.

### 6.3 Reading filters safely: `features/admin/lib/userFilters.ts`
```ts
export const ROLES: Role[] = ['DRIVER', 'RIDER', 'ADMIN']
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function readUserFilters(params: URLSearchParams): UserFilters {
  const q = params.get('q')?.slice(0, 100)
  const role = ROLES.find((r) => r === params.get('role'))
  const joinedFrom = readDate(params.get('joinedFrom'))
  let joinedTo = readDate(params.get('joinedTo'))
  if (joinedFrom && joinedTo && joinedTo < joinedFrom) joinedTo = undefined

  return { q: q || undefined, role, joinedFrom, joinedTo }
}
```
It's the same "never trust the URL" rule as `readPage`. Anything the server would reject with a **400** is dropped:
| Typed into the URL | Result | Why |
|---|---|---|
| `role=PILOT` | ignored | `ROLES.find` finds nothing → `undefined` |
| `joinedFrom=yesterday` | ignored | Doesn't match `YYYY-MM-DD` |
| from 31 Oct, to 1 Oct | "to" dropped | The server calls this "inverted dates" |
| a 150-character search | cut to 100 | The server's max length |

- **`ROLES.find(...)` instead of `as Role`:** `find` returns a real `Role` or `undefined`, so there's no unsafe type cast.
- **Comparing dates as text** (`joinedTo < joinedFrom`) works because `YYYY-MM-DD` sorts the same way alphabetically and by date.
- **`UserFilters = Omit<ListUsersParams, 'page' | 'pageSize'>`** means "the same type, minus those two". There's no second list to keep in sync.
- **`hasFilters()`** decides whether to show "Clear filters" and the "N users match." text.

Tests are in `features/admin/lib/__tests__/userFilters.test.ts`.

### 6.4 The bug we caught: keep the raw search text
The first version **trimmed** the search text (`" asha "` → `"asha"`). But the search box shows the URL value. So while typing `asha p`, the space was removed **as you typed it**, and you could never search two words.

**The fix:** the URL keeps **exactly what you typed**, and trimming happens only when building the request:
```ts
const q = useDebouncedValue(filters.q?.trim() || undefined)
```
`|| undefined` turns a search of only spaces (`"   "` → `""`) into "no search". A test now checks that `'asha p'` stays `'asha p'`.

### 6.5 Debounce: wait until the typing stops
**Without debounce:** typing "asha" is 4 keystrokes, so **4 requests**: `a`, `as`, `ash`, `asha`. Three are wasted, and they count against the server's rate limit.

**With debounce:** wait until there are **400 ms with no typing**, then send **one** request.

Think of a **lift door**. Every time someone walks in, the door's timer starts again. It only closes when nobody has come in for a few seconds.
```
type "a"     → start a 400 ms timer
type "as"    → cancel that timer, start a new one
type "ash"   → cancel, start a new one
type "asha"  → cancel, start a new one
… 400 ms of quiet …  → timer fires → debounced value = "asha" → ONE request
```

The hook (`hooks/useDebouncedValue.ts`):
```ts
export function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)   // "in 400 ms, take the new value"
    return () => clearTimeout(timer)                              // "value changed again? cancel that"
  }, [value, delay])

  return debounced
}
```
Line by line:
1. `debounced` is the "slow" copy of `value`. It starts the same.
2. Each time `value` changes, the effect runs and **schedules** an update for 400 ms later.
3. If `value` changes **again** before then, React runs the **cleanup first**, `clearTimeout` cancels the scheduled update, and a new one is scheduled.
4. Only when `value` stays the same for 400 ms does the timer fire and `debounced` catch up.

This is **the same `setTimeout` + cleanup pattern** as the resend countdown in step 11. The cleanup is what makes debounce work.

`<T>` makes it a generic hook. It works for text, numbers, anything: `useDebouncedValue<string | undefined>(…)`.

### 6.6 Two values for one search box
| | Value | Updates |
|---|---|---|
| **The search box** | `filters.q`, the raw URL text | Immediately, on every key, so typing feels instant |
| **The request** | `useDebouncedValue(filters.q?.trim() \|\| undefined)` | 400 ms after you stop typing |

```ts
const filters = readUserFilters(searchParams)                     // what's in the URL now
const q = useDebouncedValue(filters.q?.trim() || undefined)       // the calm, trimmed version
const { data } = useAdminUsers({ page, pageSize, ...filters, q }) // ...filters, then q overrides it
```
`{ ...filters, q }` copies all filters, and then **our** `q` (debounced) replaces the raw one. Order matters: the **last** key wins.

### 6.7 Changing a filter
```ts
function handleFiltersChange(changes: UserFilters) {
  updateUrl({ ...changes, page: undefined }, 'q' in changes)
}
```
Two rules in one line:
1. **`page: undefined` → back to page 1.** If you're on page 4 and search "asha", which matches 3 users, page 4 would be empty.
2. **Typing uses `replace: true`** (`'q' in changes` is true only for the search box). Normally each URL change adds a **history entry**. Without `replace`, Back would step through `asha` → `ash` → `as` → `a`. With it, typing **replaces** the current entry, and Back leaves the search in one step. Role and date changes do add entries, so Back undoes them one by one.

"Clear filters" sends all four as `undefined`, and `updateUrl` removes them from the URL.

### 6.8 The filter bar (`features/admin/components/UsersFilters.tsx`)
Like `TablePagination`, it **only shows values and reports changes**. The page owns the state.

- **Search:** `type="search"`, `maxLength={100}`, and a 🔍 icon inside the input.
- **Role:** a shadcn `Select`. Radix `Select` **can't use `""` as a value**, so "All roles" uses `'ALL'`. On change, `ROLES.find((role) => role === value)` gives a real role, or `undefined` for `'ALL'`, which means "no filter".
- **Dates:** native `<Input type="date">` gives a calendar for free, and its value is already `YYYY-MM-DD`, the format the server wants. **`max={joinedTo}`** on "from" and **`min={joinedFrom}`** on "to" stop you picking an inverted range.
- **Clear filters** only appears when `hasFilters(filters)` is true.
- Every control has a real `<Label htmlFor>`.

### 6.9 The whole chain when you type "asha"
```
type a, s, h, a  → updateUrl({ q, page: undefined }, replace)  → URL ?q=asha (box updates instantly)
                 → filters.q = "asha" every render, but debounced q is still old
… 400 ms quiet …  → debounced q = "asha"
                 → key ['admin','users',{page:1,pageSize:50,q:"asha",...}]
                 → TanStack fetches once → "3 users match."
```

### 6.10 Try it yourself
1. Type a name quickly with the **Network** tab open: **one** request after you stop.
2. Role → Driver: the URL gets `?role=DRIVER`.
3. Pick **Joined from**: the "to" calendar won't go earlier.
4. Go to page 2, then change a filter: back to page 1.
5. Type a search, then press Back: one step leaves the search.
6. Type `?role=PILOT` or `?joinedFrom=yesterday` into the URL: ignored, no 400.

---

## Files in this step

| File | Job |
|---|---|
| `services/api/ApiError.ts`, `axiosClient.ts` | `params` option on `api()` |
| `features/admin/types.ts` | `Page<T>`, `ListUsersParams`, `UserFilters` |
| `features/admin/api/adminApi.ts` | `listUsers()` |
| `lib/queryClient.ts` | The TanStack cache and its defaults |
| `main.tsx` | `QueryClientProvider` + Devtools |
| `features/auth/AuthProvider.tsx` | `endSession()` clears the cache |
| `features/admin/hooks/useAdminUsers.ts` | `useQuery` with key, fetch and `keepPreviousData` |
| `routes/guards.tsx`, `AppRoutes.tsx` | `AdminRoute` + `/admin/users` |
| `layouts/DashboardLayout.tsx` | **Users** sidebar item (`adminOnly`) |
| `features/admin/components/UsersTable.tsx` | Table, skeleton, empty row, `footer`, `isUpdating` |
| `components/page.tsx` | `TablePagination` |
| `lib/pagination.ts` | `PAGE_SIZES`, `readPage`, `readPageSize` |
| `features/admin/lib/userFilters.ts` | `ROLES`, `readUserFilters`, `hasFilters` |
| `features/admin/components/UsersFilters.tsx` | Search, role, dates, Clear |
| `hooks/useDebouncedValue.ts` | The debounce hook |
| `pages/AdminUsersPage.tsx` | Puts it all together |

---

## Questions for the backend developer

1. **Sorting:** can `GET /api/admin/users` get `sortBy` (name / email / createdAt) and `sortDir` (asc / desc)?
2. **Broken Swagger text:** descriptions are cut at commas (`q`, and the 400 response). Please quote those YAML strings. Also confirm that `q` matches name, email **and** phone.
3. **A page past the end:** `page=10` with 120 users: `200` with `items: []`, or `400`?
4. **Limits:** is `page=0` / `pageSize=0` a 400? Is there a minimum length for `q`?
5. **Time zones:** filters use IST days, while `createdAt` is UTC. Is showing "Joined" in IST correct?
6. **Rate limit:** does the global 300 requests per 15 min apply to admin lists?
7. **Admin actions:** is block / delete / change role planned? (It would add an Actions column.)

---

## Check yourself

1. Why keep the page number in the URL instead of `useState`? Name three things you get for free.
2. Why does `readPage("abc")` return 1, and what would happen if it returned `NaN`?
3. On page 5 of 230 users with 50 per page, what do `from` and `to` come out as? Why `Math.min`?
4. Why does changing rows per page, or any filter, go back to page 1?
5. You click Next. Which line of our code actually sends the request? (Trick question.)
6. In `useDebouncedValue`, what cancels the old timer, and when does it run?
7. Why does the search box show `filters.q` while the request uses the debounced `q`?
8. Why do we use `replace: true` only for the search box?
9. Why `ROLES.find(...)` instead of `value as Role`?
10. What does TypeScript check here, and what can't it check without Zod?
