# Zustand: learning it on the theme

The light/dark theme used to live in a **Context** (3 files + a `<ThemeProvider>`). Now it lives in a **Zustand
store**: one file, `src/stores/themeStore.ts`, and no Provider.

---

## 1. What Zustand is

A **store** is a box of data that lives **outside** your components. Any component can read it or change it.
No Provider, no props.

| Tool | Where the data lives | Use it for |
| --- | --- | --- |
| `useState` | inside one component | state only that component (and its children) needs |
| URL (`useListParams`) | the address bar | page, filters: should survive refresh and be shareable |
| TanStack Form | the form | what the user is typing |
| TanStack Query | a cache of **server** answers | anything that comes from the API |
| Context | a Provider high in the tree | rarely-changing things for many components (logged-in user) |
| **Zustand** | a store outside React | client state that far-apart components share, or that code outside React needs |

**Never copy API data into Zustand.** That is TanStack Query's job (caching, refetching, invalidating).

---

## 2. The store, piece by piece

```ts
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'system',                                         // data
      systemIsDark: window.matchMedia(DARK_QUERY).matches,     // data
      setTheme: (theme) => set({ theme }),                     // action
    }),
    { name: 'pool-theme', partialize: (state) => ({ theme: state.theme }) },
  ),
)
```

- `create(...)` builds the store and returns a **hook**, `useThemeStore`.
- `create<ThemeStore>()(…)`: the empty `()` is only for TypeScript. Always write it like this.
- `set({ theme })` changes the data. It **merges**: `systemIsDark` is kept, you don't copy it yourself.
- Data and the actions that change it sit **together** in one object.
- `persist(…)` saves the store to localStorage and loads it back on refresh.
  - `name`: the localStorage key.
  - `partialize`: what to save. Only `theme`; `systemIsDark` comes from the computer, not the user.

Open DevTools → Application → Local Storage and pick a theme: you'll see
`pool-theme = {"state":{"theme":"dark"},"version":0}`.

---

## 3. Reading the store: selectors

```ts
const theme = useThemeStore((state) => state.theme)
const setTheme = useThemeStore((state) => state.setTheme)
const resolvedTheme = useThemeStore(selectResolvedTheme)
```

`(state) => state.theme` is a **selector**: "I only care about this piece". The component redraws **only when
that piece changes**. The toaster picks only `selectResolvedTheme`, so choosing "dark" while the screen is
already dark doesn't redraw it.

⚠ The beginner trap:

```ts
const { theme, setTheme } = useThemeStore() // ❌ no selector: redraws on EVERY change in the store
```

Need several pieces? One call per piece (what we do), or `useShallow` from `zustand/react/shallow` when you
return an object. Without `useShallow`, a selector returning `{ … }` builds a new object every time, and Zustand
thinks it changed.

Compare with the old Context: every `useTheme()` user redrew when **anything** in the Context value changed.

---

## 4. Derived values are selectors, not stored fields

```ts
export function selectResolvedTheme(state: ThemeStore): 'light' | 'dark' {
  if (state.theme !== 'system') return state.theme
  return state.systemIsDark ? 'dark' : 'light'
}
```

"Light or dark on screen" can be **calculated** from `theme` + `systemIsDark`, so it isn't stored (a stored copy
could go out of sync). Same rule as `canEdit` in `driver/rides/rides.ts`.

---

## 5. Using the store outside React (Context can't do this)

```ts
useThemeStore.getState()            // read the current data, anywhere
useThemeStore.setState({ … })       // change it, anywhere
useThemeStore.subscribe(listener)   // run a function after every change
```

The store file uses all three, at the bottom, in plain code (no hooks, no `useEffect`):

- the OS dark-mode switch → `setState({ systemIsDark })`
- `applyTheme(getState())` once at the start, then `subscribe(applyTheme)` → the `dark` class on `<html>` always
  matches the store

In the old version these were two `useEffect`s inside `ThemeProvider`.

---

## 6. Before and after

| | Context (before) | Zustand (now) |
| --- | --- | --- |
| Files | `ThemeContext.ts`, `ThemeProvider.tsx`, `hooks/useTheme.ts` | `stores/themeStore.ts` |
| Provider in `main.tsx` | `<ThemeProvider>` | none |
| Saving to localStorage | `readStoredTheme()` + `try/catch` by hand | `persist` |
| Avoid extra redraws | `useMemo` + `useCallback` | selectors |
| OS listener + `dark` class | 2 `useEffect`s | `setState` + `subscribe`, outside React |

`index.html` has a tiny script that runs **before React loads** (no white flash for dark-mode users). It now
reads `pool-theme` and its JSON shape. The old `theme` key is ignored, so everyone's choice resets to "System" once.

---

## 7. Common mistakes

1. Putting API data in a store (use TanStack Query).
2. Using the store without a selector.
3. Returning a new object/array from a selector without `useShallow`.
4. Storing values you can calculate.
5. Changing data directly (`state.items.push(x)`): always `set((state) => ({ items: [...state.items, x] }))`.
6. One giant store: prefer small stores per job (`themeStore`, `cartStore`, …).
7. Reaching for Zustand first: most state is still `useState`, the URL, or TanStack Query.

---

## 8. Try it yourself

1. Add `console.log('toaster render')` inside `Toaster` (`components/ui/sonner.tsx`). Switch Dark → System while
   your computer is dark: no log (the resolved theme didn't change). Remove the log afterwards.
2. In the browser console, run `localStorage.getItem('pool-theme')` before and after picking a theme.
3. Change your computer's appearance (System Settings → Appearance) while "System" is picked: the app follows
   (that's the `matchMedia` listener calling `setState`).
4. **Exercise (on paper first):** plan a `cartStore` for a shopping cart. What data? What actions? Which values
   are derived (selectors)? What should `persist` save?

---

# Lesson 2: the auth store

`AuthProvider.tsx` + `useAuth.ts` (Context) became `features/auth/authStore.ts` + `hooks/useLogout.ts`.

## 9. Async actions

An action is just a function, so it can `await` the server first and call `set` after:

```ts
login: async (values) => signIn(await loginRequest(values)),
```

`signIn(user)` is a small function **inside** the store (`set({ status: 'authenticated', user })`), shared by
login, signup, verify and rename. If the request fails, `set` never runs and the error goes back to the page,
which shows it with `getErrorMessage`.

## 10. Starting the store outside React

```ts
// main.tsx, before createRoot(...)
void useAuthStore.getState().checkSession()
```

The old `useEffect` ran twice in development (StrictMode), so it needed an `AbortController`. Plain code runs
once.

## 11. Reading several values: `useShallow`

```ts
useAuthStore(useShallow((state) => ({ status: state.status, user: state.user })))
```

The selector makes a new object every time. Without `useShallow`, Zustand sees "new object = changed" on every
store update. `useShallow` compares `status` and `user` inside it instead. (Used in `routes/guards.tsx`.)

Pages that need **one action** use a plain selector: `useAuthStore((state) => state.login)`. Actions never
change, so those pages never redraw because of auth. With Context, every login or rename redrew all of them.

## 12. Talking to code outside React (axios)

The store registers a function with axios, at the bottom of `authStore.ts`:

```ts
setSessionExpiredHandler(() => useAuthStore.getState().endSession())
```

Why not `import { useAuthStore }` inside `axiosClient.ts` (like bear-portal-new's org store)? The auth store
imports `authApi`, which imports axios. Axios importing the store back would be a **circular import**.
bear-portal-new's store calls no API, so it doesn't have this problem.

## 13. What can't go in a store: hooks

`navigate` comes from `useNavigate()`, and hooks only work inside components. So logout is a hook,
`useLogout()`: request → `endSession()` → `navigate('/login')`. The last two run back to back, so React draws
them together and `ProtectedRoute` never sees "logged out but still on the page".

## 14. Context vs Zustand for auth

| | Context (before) | Zustand (now) |
| --- | --- | --- |
| Provider in `main.tsx` | `<AuthProvider>` | none |
| `useMemo` / `useCallback` to avoid redraws | yes | not needed (selectors) |
| First session check | `useEffect` + `AbortController` | `checkSession()` once in `main.tsx` |
| Connecting axios | `useEffect` in the Provider | one line in the store file |
| Logout + navigate | inside the Provider | `useLogout()` hook |

**The other option:** the user *is* server data, so `useQuery({ queryKey: ['me'], queryFn: getMe })` would
also work (login → `setQueryData(['me'], user)`, logout → `queryClient.clear()`). A store is simpler for
"is anyone logged in?", which is why most apps keep the session in a store.

## 15. Try it yourself

1. Log in, rename yourself on My Profile: the sidebar name changes (it reads the same store).
2. Log out from the sidebar, then log in as another role: you land on the dashboard, not the old page.
3. Network tab, refresh: `/api/auth/me` is called **once** (it was twice in development before).

---

# Lesson 3: testing a store

File: `features/auth/__tests__/authStore.test.ts`. No screens, no clicking: call the actions, look at the board.

## 16. The setup (top of the file)

| Piece | What it does |
| --- | --- |
| `vi.mock('../api/authApi')` | every request function becomes a fake; no real server |
| `vi.mocked(login).mockResolvedValue(ASHA)` | "this fake succeeds with Asha" |
| `vi.mocked(login).mockRejectedValue(new Error('…'))` | "this fake fails with this error" |
| `const startState = useAuthStore.getState()` | a photo of the board before any test |
| `useAuthStore.setState(startState, true)` in `beforeEach` | put the photo back: `true` = **replace**, not merge |
| `vi.resetAllMocks()` / `vi.restoreAllMocks()` | wipe the fakes' memory, remove spies |

The store is **one board shared by every test**. Without the reset, a test that logs Asha in would leak into
the next test.

## 17. Every test is the same three steps

```ts
vi.mocked(login).mockResolvedValue(ASHA)                     // 1. Arrange: what the fake server answers
await useAuthStore.getState().login({ email, password })     // 2. Act: call the action directly
expect(useAuthStore.getState()).toMatchObject({ status: 'authenticated', user: ASHA }) // 3. Assert
```

`toMatchObject` checks only the listed fields (the board also holds the action functions).

## 18. Useful tricks

- **An action that should fail:** `await expect(action()).rejects.toThrow('message')`.
- **An action that catches its own error** (`checkSession`): just `await` it, then check the board.
- **Start already logged in:** `useAuthStore.setState({ status: 'authenticated', user: ASHA })`
  (bear-portal-new's tests do the same). Use `setState` to **prepare**, the real action for what you **test**.
- **Check a side effect:** `const clear = vi.spyOn(queryClient, 'clear')` → `expect(clear).toHaveBeenCalledOnce()`.

## 19. Why the theme store has no tests

Tests run in plain Node: there is no `window` or `localStorage`. `themeStore.ts` uses `window.matchMedia` as
soon as it loads, so importing it in a test would crash. Testing it needs a "fake browser" (`jsdom`), a
separate topic.

## 20. Try it yourself

1. **Make a test fail on purpose.** In `authStore.ts`, delete `queryClient.clear()` from `endSession` and run
   `npx vitest run src/features/auth`. The endSession test fails and tells you why. Put the line back.
2. **Write one test yourself:** "signup saves the user". Copy the first `login` test, import `signup` from
   `'../api/authApi'` (the fake), use `vi.mocked(signup).mockResolvedValue(ASHA)`, then call
   `useAuthStore.getState().signup({ … })`.

---

# Lesson 4: watching the store with DevTools

## 21. What it is

The **Redux DevTools** browser extension shows a store live: every change (with its name), the whole board
after it, and what changed. Zustand's `devtools` wrapper connects a store to it. It is **off in production**
automatically (only `npm run dev` uses it) and quietly does nothing without the extension (or in tests).

## 22. The code

```ts
create<AuthStore>()(devtools((set) => { … }, { name: 'auth' }))   // name = the store's label in DevTools

set({ status: 'unauthenticated', user: null }, false, 'auth/endSession')
//   ① what changes                            ② replace?  ③ the change's name
```

- ② `false` = merge (the normal behaviour). It's only written because ③ comes after it.
- Without ③, every change shows as `anonymous`.
- `signIn(user, 'auth/login')`: the shared helper receives the name from the action that calls it.
- Outside the store, `setState` takes a name too: `useThemeStore.setState({ … }, false, 'theme/systemChanged')`.

With several wrappers, **`devtools` goes outermost**: `devtools(persist(core, …), { name: 'theme' })`, so it
sees every change, including `persist` loading the saved value.

## 23. Try it yourself

1. Open the app, then DevTools (F12) → **Redux** tab. Top-left dropdown: pick **auth** or **theme**.
2. Refresh: you'll see `auth/checkSession`. Click it → **State** tab = the whole board, **Diff** tab = only
   what changed (`status: 'loading' → 'authenticated'`).
3. Rename yourself on My Profile → `auth/updateName` appears, Diff shows the old and new name.
4. Pick a theme in the sidebar → `theme/setTheme` in the **theme** store.
5. **Time travel:** in the theme store, click an older entry and press **Jump**: the app goes back to that
   theme. Press the last entry to come back.
6. Log out → `auth/endSession`: `user` becomes `null`.

---

# Lesson 5: a preferences store, used inside a hook

> **A practice example, not used in the app.** It was built, then removed: nobody asked for a remembered page
> size, and bear-portal-new keeps page size in the URL only (`useTableQueryState`, default 20 per table). Its
> stores hold only what the whole app truly needs (active organisation and property). The hardest part of
> Zustand is deciding when **not** to add a store. The ideas below still apply to any store you do need.

Pick 25 rows on one table → every table (Users, Rides, Vehicles, Audit log) opens with 25, even tomorrow.

## 24. Design a store on paper first

| Question | Answer |
| --- | --- |
| What data? | `pageSize` |
| What actions? | `setPageSize(size)` |
| Survive a refresh? | yes → `persist` (`pool-preferences`) |
| Anything derived? | no |
| Does it belong in a store? | not server data, needed by 4 pages, the URL forgets it → yes |

**One job per store.** Page size has nothing to do with colours, so it gets its own store instead of joining
`themeStore`. bear-portal-new also keeps two tiny stores rather than one big one.

## 25. The store (`stores/preferencesStore.ts`)

Same pattern as the theme: `create<Shape>()(devtools(persist((set) => ({ … }), { name }), { name }))`.
No `partialize` needed: `persist` saves with `JSON.stringify`, which skips functions, so only `pageSize` is saved.

## 26. A store inside a custom hook (`hooks/useListParams.ts`)

```ts
const preferredPageSize = usePreferencesStore((state) => state.pageSize)
const setPreferredPageSize = usePreferencesStore((state) => state.setPageSize)

pageSize: readPageSize(searchParams.get('pageSize') ?? String(preferredPageSize)),
setPageSize: (size) => {
  setPreferredPageSize(size)                          // remember it
  updateUrl({ page: undefined, pageSize: undefined }) // page 1, and no second copy in the URL
},
```

- A store hook works inside **any** hook, not only in components. Changing this one hook changed all four
  table pages, without touching them.
- `a ?? b`: use `a` unless it's `null`/`undefined`, then `b`. Here: a shared link's `?pageSize=` first, else
  the saved choice.
- **Never trust saved data.** localStorage can be edited by hand like a URL, so `readPageSize` checks both
  (anything that isn't 10/25/50/100 → 50).
- **One copy only.** After saving to the store, `pageSize` is removed from the URL so the two can't disagree.

## 27. Several stores side by side

| Store | Job | Saved? | Where |
| --- | --- | --- | --- |
| `themeStore` | colours | yes | `src/stores/` (whole app) |
| `preferencesStore` | table settings | yes | `src/stores/` (whole app) |
| `authStore` | who's logged in | no (the cookie is) | `features/auth/` (its module) |

Each one is imported only where it's needed. In Redux DevTools, the dropdown lists all three.

## 28. Check before adding a store

Ask "did anyone ask for this, and does the whole app need it?" Theme (asked for, every page) and the login
session (every page and axios) pass. A remembered page size doesn't, so it stays in the URL.
