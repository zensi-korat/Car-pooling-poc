# Zustand interview questions (with answers from this project)

Short answers first; the example in brackets is where to look in this repo.

## Basics

**1. What is Zustand?**
A small state-management library for React. You create a store with `create()`, which returns a hook. Components
read slices of state with selectors and redraw only when that slice changes. No Provider, no reducers, no actions
objects. (`src/stores/uiStore.ts`)

**2. How is it different from Context?**
Context redraws every consumer when the value changes, needs a Provider, and can't be used outside React. Zustand
redraws only components whose selected value changed, needs no Provider, and works anywhere through
`getState`/`setState`/`subscribe`. Context is still fine for rarely-changing values (and for dependency injection,
like the per-panel store in `RoomPanel.tsx`).

**3. How is it different from Redux (Toolkit)?**
Redux: one store, slices with reducers, actions are dispatched objects, middleware sees every action, a Provider,
more structure and tooling (RTK Query, listener middleware). Zustand: actions are plain functions that call `set`,
much less code, less enforced structure. See `../redux-chat/LEARN.md` for the same features in both.

**4. What do `set` and `get` do?**
`set` changes state: pass an object (merged into the top level) or a function of the old state. The second argument
`true` replaces instead of merging. `get` reads the latest state inside actions, which is useful after an `await`.
(`connectionSlice.ts`: `if (!get().me)` after `await openSocket()`)

**5. Does `set` merge deeply?**
No, only the top level. Nested objects must be copied yourself (spread) or with the immer middleware.
(`messagesSlice.ts` uses immer for `history[room].messages[i].delivery`)

## Re-renders and selectors

**6. When does a component re-render?**
When the value its selector returns is different by `Object.is`. `useStore()` with no selector returns the whole
state, so it redraws on every change.

**7. What is `useShallow` for?**
When a selector returns a new object or array each time (`{ a: s.a, b: s.b }`), `Object.is` always says "changed".
`useShallow` compares the fields one by one instead. (`ChatScreen.tsx` Header, `StatsPanel`)

**8. Why can a selector cause an infinite loop?**
If it returns a new object every call (`s.history[id] ?? {}`), React sees a new snapshot every time. Use a shared
constant for fallbacks. (`EMPTY_HISTORY` in `selectors.ts`)

**9. Where do derived values go?**
In selector functions, computed when read. Never store them, because a stored copy goes stale.
(`selectTotalUnread`, `selectStats`)

## Async and side effects

**10. How do you do async in Zustand?**
Make the action `async` and call `set` before and after the `await`. No thunks needed. Keep a `status` field
(`idle | loading | success | error`), not separate booleans. (`loadHistory`)

**11. How do you avoid race conditions?**
Key data by id so answers can't land in the wrong place, cancel stale requests with `AbortController`, ignore
aborted errors, and re-check `get()` after every `await`. (Lesson 3.3; `searchStore.ts`)

**12. How do you implement debounce in a store?**
Keep the timer outside the state, `clearTimeout` on every call, start a new `setTimeout`, and abort the previous
request. (`searchStore.setQuery`)

**13. How do you do optimistic updates?**
Add the item at once with a temporary id and a `sending` flag, send it, then swap it for the server's copy on success
or mark it failed (with Retry) on error. (`messagesSlice.sendMessage` / `receiveMessage` / `markFailed`)

**14. Where do sockets, timers and AbortControllers go?**
Next to the store (module variables), not in it: they're tools, not data. They can't be persisted or shown in
DevTools, and storing them would cause useless redraws. (`socket.ts`)

**15. Can you use a store outside React?**
Yes: `useStore.getState()`, `useStore.setState()`, `useStore.subscribe()`. Used in axios interceptors
(bear-portal-new), socket handlers (`handleServerMessage`) and side effects (`effects.ts`).

## Middleware

**16. Which middleware do you know?**
`devtools` (Redux DevTools, named actions), `persist` (localStorage etc., `partialize`, `version` + `migrate`),
`immer` (mutable-style updates), `subscribeWithSelector` (subscribe to one value, with the previous value),
`combine` (infer types from the initial state).

**17. In what order do you combine them?**
`devtools` outermost so it sees everything; `immer` innermost so outer layers get plain objects; `persist` inside
devtools. (`stores/chat/index.ts`)

**18. How do you write your own middleware?**
A function that takes the recipe `(set, get, store) => state` and returns a new recipe that passes a wrapped `set`
in. (`middleware/logger.ts`)

**19. What should you persist, and what not?**
User intent and preferences (drafts, theme, mute). Not connection status, server data (it goes stale), or secrets
(localStorage is readable by any script). Use `partialize`, and `version` + `migrate` when the shape changes.

**20. How do you sync state across tabs?**
`BroadcastChannel` (post on change; on receive, `setState` without re-posting), or listen to the `storage` event and
call `persist.rehydrate()`. (`uiStore.ts`)

## Structure and testing

**21. How do you organise a big store?**
Slices: one `StateCreator` per topic, all spread into one `create()`. Each slice gets the whole store's `set`/`get`.
Use separate stores for unrelated data. (`stores/chat/`)

**22. When would you use `createStore` + Context instead of `create`?**
When each instance of a component needs its own store (reusable widgets shown many times), or for SSR/tests needing
a fresh store per request. (`RoomPanel.tsx` panel store)

**23. What are transient updates?**
Subscribing with `store.subscribe` in an effect and writing to a ref/DOM directly, so very frequent changes don't
redraw the component. (`TypingIndicator`)

**24. How do you reset a store (e.g. on logout)?**
Keep an `INITIAL_STATE` constant, `set(INITIAL_STATE)` (or `setState(initial, true)`), and also clean up tools:
timers, sockets, requests. (`leave()`)

**25. How do you test a store?**
Mock the API module, reset state in `beforeEach` with `setState(initial, true)`, call actions through `getState()`,
assert on `getState()`. Fake timers for debounce/timeouts. No rendering needed. (`stores/__tests__/`)

## Judgement

**26. When should you NOT use Zustand?**
Server data (use TanStack Query or RTK Query: caching, refetch, dedupe), state of one component (`useState`),
URL-worthy state (filters, pagination), form state (a form library), values you can compute.

**27. Zustand or Redux Toolkit for a new project?**
Zustand for small/medium apps and teams that want little ceremony. RTK when you want enforced structure across a big
team, RTK Query in the same toolset, the listener middleware, or the app is already on Redux. Both are fine; the
data-placement decisions (server vs client state) matter more than the library.

**28. What does bear-portal-new use Zustand for?**
Two small persisted stores (active organisation and property). They're read outside React in the axios interceptor
(`getState()`), cleared on logout in `useLogout`, and tested with `setState`. Server data is TanStack Query;
filters/pagination are in the URL.
