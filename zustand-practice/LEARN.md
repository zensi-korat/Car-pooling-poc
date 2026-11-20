# Zustand practice: Ride Cart

A small app to learn every Zustand pattern by building it. No backend, no login: a few fixed rides
(`src/data/rides.ts`) and a cart.

Run it: `npm run dev` in this folder. Open the browser console (F12) and the **Redux** DevTools tab.

| Step | Topic |
| --- | --- |
| 1 | create, set (value and function), get, selectors, derived selectors, useShallow, persist, devtools |
| 2 | immer: easy nested updates |
| 3 | slices: splitting a big store |
| 4 | subscribeWithSelector: react to one specific change |
| 5 | createStore + Context: one store per component, and when Context is better |
| 6 | testing the cart + summary |

---

## Step 1: the basics, in one store

### Files

| File | Job |
| --- | --- |
| `src/stores/cartStore.ts` | the store: `items` + 5 actions + 2 derived selectors |
| `src/components/Header.tsx` | the 🛒 count (derived selector) |
| `src/components/RideList.tsx` | one card per ride, "Add seat" (selector with a prop) |
| `src/components/CartPanel.tsx` | the cart list, total, checkout (useShallow) |

### Design on paper first

| Question | Answer |
| --- | --- |
| Data? | `items: { rideId, seats }[]` |
| Actions? | `addSeat`, `removeSeat`, `removeRide`, `clear`, `checkout` |
| Saved? | yes: `persist` (`practice-cart`) |
| Derived? | seat count, total: selectors, never stored |

### The two ways to call `set`

```ts
set({ items: [] })                                                // 1. a fixed new value
set((state) => ({ items: [...state.items, { rideId, seats: 1 }] })) // 2. new value from the old one
```

Use the function form whenever the new value depends on the current one ("one more seat").
Return `state` itself for "no change": Zustand skips the update completely.

### `get()`: read inside an action

```ts
(set, get) => ({
  checkout: () => {
    const total = selectTotal(get()) // read first
    set({ items: [] })               // then change
    return `Booked … for ${total}`
  },
})
```

### Never change state in place

```ts
state.items.push(newItem)                   // ❌ same array → Zustand thinks nothing changed → no redraw
items: [...state.items, newItem]            // ✅ add
items: state.items.map((i) => (… ? { ...i, seats: i.seats + 1 } : i)) // ✅ change one
items: state.items.filter((i) => i.rideId !== rideId)                 // ✅ remove
```

Zustand compares old and new with `===`. A changed-in-place array is still the "same" array.
(Step 2's `immer` lets you write `push` safely.)

### Three kinds of selector

```ts
useCartStore(selectSeatCount)                                     // derived: a calculated number
useCartStore((state) => state.items.find((i) => i.rideId === ride.id)?.seats ?? 0) // uses a prop
useCartStore(useShallow((state) => ({ seats: selectSeatCount(state), total: selectTotal(state) }))) // several
```

- A selector that returns a **number/string** never needs `useShallow`: `3 === 3`.
- A selector that returns a **new object or array** needs `useShallow`, or it redraws every time
  (and can loop forever in Zustand 5).
- Picking several **actions** with `useShallow` is fine too: actions never change.

### Try it

1. Open the console, click **Add seat** on Ahmedabad → Vadodara. You'll see `Header drew`,
   `RideCard r1 drew`, `CartPanel drew`, but **not** `RideCard r2/r3/r4`. That's the per-ride selector.
2. Add seats until "Full" (the store refuses more than `seatsLeft`).
3. Refresh: the cart is still there (`persist`). Local Storage → `practice-cart`.
4. Redux tab → **cart**: every change is named (`cart/addSeat`, `cart/checkout`…).
5. **Why changing in place is a sneaky bug:** if `addSeat` did `item.seats += 1; return { items: state.items }`,
   the 🛒 count would still update (its selector recalculates a new number). But any component selecting only
   `state.items` would **not** redraw (same array), and DevTools' Diff would show nothing changed. Half the
   screen updates, half doesn't: a bug that's very hard to find. Always build new arrays and objects.

---

## Step 2: immer (easy nested updates)

### The feature

Each seat gets a passenger name. A cart line is now `{ rideId, passengers: ['Asha', 'Ravi'] }`, and the seat
count is `passengers.length` (derived: it can never disagree with the names).

### The problem without immer

Renaming passenger 2 of ride r1 means rebuilding every level by hand:

```ts
set((state) => ({
  items: state.items.map((item) =>
    item.rideId === rideId
      ? { ...item, passengers: item.passengers.map((p, i) => (i === index ? name : p)) }
      : item,
  ),
}))
```

Two `.map`s and a spread for one change. Miss one `...` and you're back to "changed in place".

### With immer

```ts
set((state) => {
  const item = state.items.find((i) => i.rideId === rideId)
  if (item) item.passengers[index] = name
})
```

`state` is a **draft** (a practice copy). Change it directly, return nothing. immer then builds the new
objects for you, like "Track changes": edit freely, a clean new version comes out. Parts you didn't touch keep
the same objects, so their selectors stay calm.

| Job | Step 1 (by hand) | Step 2 (immer) |
| --- | --- | --- |
| add a line | `[...state.items, line]` | `state.items.push(line)` |
| one more seat | `.map(... { ...i, seats: i.seats + 1 } ...)` | `item.passengers.push('')` |
| remove a line | `state.items.filter(...)` | `state.items = state.items.filter(...)` (still fine) |
| rename a passenger | two `.map`s + spread | `item.passengers[index] = name` |

### Setup

```ts
import { immer } from 'zustand/middleware/immer'   // + npm install immer

create<CartStore>()(devtools(persist(immer((set, get) => ({ … })), { … }), { name: 'cart' }))
```

Order from the outside in: **show** (devtools) → **save** (persist) → **change** (immer, closest to the actions).

### immer rules

- Inside `set(fn)`: **either** change the draft **or** return a new value. Never both.
- "No change": `return` without touching the draft. immer gives back the same state → no update.
- `set({ items: [] })` (a plain value) still works as before.
- When to use it: nested data (lists inside objects inside lists). For flat data like `{ theme }`, plain
  `set` is simpler, which is why Pool's stores don't use immer.

### Bonus: when the saved shape changes (`version` + `migrate`)

The browser still had Step 1's cart saved as `{ seats: 2 }`. Loading it into the new code would crash
(`undefined.length`). `persist` handles this:

```ts
{ name: 'practice-cart', version: 1, migrate: () => ({ items: [] }) }
```

- `version`: the shape of the saved data. Step 1 was version 0 (the default).
- `migrate(saved, oldVersion)`: runs once when the saved version is older. Return the new shape.
- Here old carts are simply dropped. A real app would convert them instead:

```ts
migrate: (saved, oldVersion) => {
  const old = saved as { items: { rideId: string; seats: number }[] }
  if (oldVersion === 0) return { items: old.items.map((i) => ({ rideId: i.rideId, passengers: Array(i.seats).fill('') })) }
  return saved
}
```

Rule: **every time you change a persisted store's shape, bump `version`.**

### Try it

1. Your Step 1 cart is gone after the reload (that's `migrate`). Local Storage → `practice-cart` now shows
   `"version":1`.
2. Add 2 seats on a ride: two name boxes appear. Type names.
3. Console while typing: only `CartPanel drew`. Header and RideCards don't redraw (their numbers didn't change).
4. Redux tab: `cart/setPassengerName` on each key press, Diff shows exactly one name changing.
5. Press − : the last name box disappears. At 0 seats the ride leaves the cart.
