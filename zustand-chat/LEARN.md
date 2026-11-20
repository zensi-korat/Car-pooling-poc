# Pool Chat: learn Zustand in a real-time app

A small chat app with a real server, built to learn Zustand the way real projects use it: async actions, data the
server **pushes**, loading and errors, race conditions, optimistic updates, middleware, slices, tests.
Compared with bear-portal-new along the way. Phase 7 (Redux Toolkit) is in `../redux-chat/LEARN.md`.

`CURRICULUM.md` maps every topic of your list to the lesson (and file) that teaches it.

## Run it (two terminals)

```
npm run server   # the chat server on port 4000 (restarts when server/index.ts changes)
npm run dev      # the app (Vite forwards /ws and /api to the server)
npm test         # the store tests
```

Open two browser tabs with two different names to chat with yourself. Open Redux DevTools → pick **chat**,
**ui**, **notifications** or **search** in the drop-down to watch each store.

## All the files

```
server/index.ts                   the fake backend: rooms, history (slow, sometimes failing), search, socket
src/
  protocol.ts                     every shape the server and the app share (Profile, Room, Message, socket messages)
  api.ts                          the HTTP calls: getRooms (fetch), getHistory + searchMessages (axios)
  effects.ts                      code that WATCHES the stores from outside React (tab title, beep, join/leave toasts)
  stores/
    chat/                         ONE store, split into slices
      index.ts                    create() + middleware, useMe()
      types.ts                    the state and action types of every slice
      socket.ts                   the WebSocket (a tool next to the store, not in it)
      connectionSlice.ts          me, status, online users · join, leave, updateProfile
      roomsSlice.ts               rooms, active/side room, history per room, unread, typing
      messagesSlice.ts            drafts, optimistic send, retry, receive
      selectors.ts                derived values (total unread, stats, one room's history)
    middleware/logger.ts          our own middleware
    uiStore.ts                    sidebar + mute (persist + cross-tab sync)
    notificationsStore.ts         toasts
    searchStore.ts                search with debounce + cancel
    __tests__/                    store tests
  components/
    JoinScreen.tsx  ChatScreen.tsx  Sidebar.tsx  RoomPanel.tsx  SearchBox.tsx  Toasts.tsx  Avatar.tsx
```

---

## Lesson 1: the basics, and the connection (topics 1–6, 14)

### The six fundamentals in a few lines

1. **State** = data that changes while the app runs (who's online, the open room). **State management** = deciding
   where each piece lives and how components read and change it, so the screen always matches the data.
2. **What Zustand solves:** passing props through many layers, Context redrawing every consumer on any change,
   Context being unusable outside React (sockets, axios), and Redux's setup weight. One `create()` call, no Provider.
3. **Local vs Context vs Zustand:** one component → `useState`. A few rarely-changing values for part of the tree →
   Context. Shared by far-apart components, changes often, or needed outside React → Zustand.
4. **A store** = one shared box of data plus the actions allowed to change it. It lives outside components.
5. **`create()`** builds the store and gives back a hook (`useChatStore`). The hook also has `getState`, `setState`
   and `subscribe` for code outside React.
6. **`set`** changes state (a value, or a function of the old state; it merges the top level). **`get`** reads the
   latest state inside actions.

### Idea 1: a tool lives next to the store, not in it (`stores/chat/socket.ts`)

```ts
export const socketRef: { current: WebSocket | null } = { current: null }
```

The store holds what the **screen shows** (`status: 'online'`). The socket is a tool: it can't be saved,
can't be shown in DevTools, and no component draws it. Pool's `queryClient` is the same kind of thing.
It's an object with `current` (like `useRef`) so other files can replace the socket.

### Idea 2: an async action (`connectionSlice.ts` → `connect()`)

```ts
set({ status: 'connecting' })        // show progress right away
try {
  const ws = await openSocket()      // wait
  set({ status: 'online' })
} catch (error) {
  set({ status: 'offline', error: error.message })
}
```

`WebSocket` reports through events. `openSocket()` wraps them in a Promise (`onopen` → resolve,
`onerror` → reject) so the action can `await` it.

### Idea 3: the server writes into the store, from outside React

```ts
ws.onmessage = (event) => handleServerMessage(JSON.parse(event.data))
// presence → set({ onlineUsers: message.users }, false, 'server/presence')
```

Nobody clicked anything; the server pushed. bear-portal-new **reads** its stores from outside React (`getState()`
in the axios interceptor); here we also **write** from outside React. Both are normal.

### Idea 4: reconnect and reset

- Connection lost → `status: 'offline'` → try again every 2 s while `me` is still set.
- `leave()` = stop the retries, close the socket, cancel requests, put the initial state back. The same idea as
  bear-portal-new's `useLogout` (clears its two stores) and Pool's `endSession`.

### Try it

1. Start only `npm run dev` and join: "Offline. Could not reach the chat server… Retrying…".
2. Start `npm run server`: within 2 s the dot turns green by itself.
3. Stop the server (Ctrl+C): every tab shows Offline. Start it: all come back.

---

## Lesson 2.1: your profile (topics 7, 8, 9)

**Goal:** set your availability (Available / Busy / Away) and colour; every tab sees it at once.

### Idea 1: the profile is an object in the store

```ts
me: { name: 'Asha', availability: 'busy', colour: 'violet' } // Profile, from protocol.ts
```

The lists `AVAILABILITIES` and `COLOURS` (with `as const`) make the types, so the dropdown and the type can never
disagree (the same trick as `xSchema.options` in Pool).

### Idea 2: one user, many components: `useMe()` (`stores/chat/index.ts`)

```ts
export function useMe(): Profile {
  const me = useChatStore((state) => state.me)
  if (!me) throw new Error('useMe() used outside the chat screen')
  return me
}
```

Header and the online list both call it. Change your colour → `me` is a new object → both redraw. Same as Pool's
`useCurrentUser()`: inside the chat screen `me` is never null, so no component writes `if (!me)`.

### Idea 3: updating = my copy now, everyone's copy from the server

```ts
updateProfile: (changes) => {
  const profile = { ...get().me, ...changes }       // keep the rest, change only what was passed
  set({ me: profile }, false, 'chat/updateProfile')  // 1. my header changes at once
  send({ type: 'updateProfile', profile })           // 2. tell the server
}                                                    // 3. the server pushes `presence` to every tab
```

`Partial<Omit<Profile, 'name'>>` = "any of availability / colour, never name".

### Idea 4: a reconnect must not reset the profile

`join(name)` makes a **new** profile. So the socket part lives in `connect()`, which sends `get().me` **as it is
now**. Change your colour while offline → nothing is sent → the next `connect()` sends the new colour.

### Check yourself

1. Why does the header read `me`, but the online list `onlineUsers`, even for "you"?
2. What would go wrong if a reconnect called `join(me.name)` instead of `connect()`?
3. Why is it `availability` and not `status`?

<details><summary>Answers</summary>

1. `me` is my own copy (changes instantly). `onlineUsers` is the server's list (the truth for everybody, a moment
   later). The list shows everyone the same way, so it uses the server's copy.
2. `join` builds a fresh profile (available, random colour), so every reconnect would undo your choices.
3. The store already has `status` (the connection). One name for two meanings is a bug waiting to happen.

</details>

---

## Lesson 2.2: rooms and app-wide UI state (topic 10)

**Goal:** a list of rooms; open one; open a second one **beside** it; a sidebar that opens on phones.

### Idea 1: "which room is open" is app-wide state

`activeRoomId` and `sideRoomId` live in the chat store (`roomsSlice.ts`). Who needs them?
the room list (highlight), the panels (what to show), the unread counter (don't count the room you're looking at),
search results (open the room of a result), and the history loader. Far apart, and used by actions too → store.

### Idea 2: pure UI state in its own small store (`uiStore.ts`)

```ts
sidebarOpen: false, toggleSidebar, closeSidebar
```

The header's ☰ button opens it, `Sidebar` reads it, and a click on a room (`RoomItem`) closes it. Three
components, far apart → a store. It's a separate store from the chat because it has nothing to do with chat data:
"one job per store".

### Idea 3: not everything belongs in a store

The **room filter** box ("Filter rooms") is `useState` inside `RoomList`, because only that list uses it.
The rule from Pool's CLAUDE.md, in order: server data → TanStack Query · one component → `useState` · page/filters
in a page app → URL · form input → a form library · shared by far-apart components → a store.

> If the filter were also shown somewhere else (say "3 of 12 rooms" in the header), it would move into the store.

### Try it

1. Click a room: it opens. Click the ⧉ icon next to another: it opens beside (wide screens).
2. Make the window narrow: the sidebar hides; ☰ opens it; picking a room closes it.

---

## Lesson 2.3: notifications, a dashboard, multiple stores (topics 11, 12)

### Idea 1: a notifications store anyone can call (`notificationsStore.ts`)

```ts
notify: (text, tone = 'info') => {
  const id = nextId++
  set((state) => ({ toasts: [...state.toasts, { id, text, tone }].slice(-3) }), false, 'notifications/notify')
  setTimeout(() => get().dismiss(id), 4000)
}
```

Called from three kinds of places:
- a component: `useNotificationsStore((s) => s.notify)`;
- **another store's action**: `messagesSlice.markFailed` calls `useNotificationsStore.getState().notify(...)`;
- **plain code**: `effects.ts` ("Ravi joined").

`Toasts.tsx` is the only component that draws them. Pool uses `sonner` for this; a toast store is what such
libraries do inside.

### Idea 2: a dashboard is just selectors (`StatsPanel` + `selectStats`)

```ts
export function selectStats(state: ChatStore) {
  const loaded = Object.values(state.history).flatMap((room) => room.messages)
  return { online: state.onlineUsers.length, rooms: state.rooms.length, loadedMessages: loaded.length, … }
}
// component:
const stats = useChatStore(useShallow(selectStats))
```

Nothing is stored twice. Every number is **calculated** from the state. `selectStats` builds a new object each
time, so it's read with `useShallow` (compare field by field; redraw only when a number changes).

### Idea 3: several stores, each with one job

| Store | Job | Talks to others? |
| --- | --- | --- |
| chat | connection, rooms, messages | calls notifications (`getState()`) |
| ui | sidebar, mute | read by `effects.ts` (mute) |
| notifications | toasts | called by everyone |
| search | search box | its result click calls chat's `openRoom` |

Stores talk to each other by calling `otherStore.getState().action()` **inside actions** or plain code, never
by importing a hook. Watch for circles: if two stores import each other, move the shared part out.

---

## Lesson 3.1: sync vs async, loading / success / error (topics 13, 16)

### Sync vs async

- **Sync** actions finish immediately: `openRoom`, `setDraft`, `updateProfile`. One `set`, done.
- **Async** actions wait for something (network, timer): `loadRooms`, `loadHistory`, `join`. They call `set`
  **several times**: before (loading), after (success), or on failure (error).

Zustand needs nothing special for async: an action is just a function, so it can be `async`.
(Redux needs `createAsyncThunk` for this, see Phase 7.)

### Loading state per room (`roomsSlice.ts`)

```ts
history: Record<string, RoomHistory>    // { general: { status, messages, error }, rides: {…} }
type RoomHistory = { status: 'idle' | 'loading' | 'success' | 'error'; messages: ChatMessage[]; error: string | null }
```

One `status` per room, not one for the whole app: General can be loading while Rides already shows messages.
And the panel (`MessageList`) picks what to show from it:

| status | screen |
| --- | --- |
| `loading` (and no messages yet) | "Loading messages…" |
| `error` | the server's message + **Retry** |
| `success` + empty | "No messages yet." |

`status` as one field (not `isLoading` + `isError` booleans) makes impossible mixes ("loading AND error")
impossible to write.

### Try it

Open **Random (flaky)**: half the time you'll see the server's own error and a Retry button. Retry until it loads.
DevTools: `rooms/loadHistory` → `rooms/historyFailed` or `rooms/historyLoaded`.

---

## Lesson 3.2: fetch vs axios, and API failures (topics 15, 18)

`src/api.ts` uses both on purpose:

```ts
// fetch: built into the browser. It does NOT throw on 404/500.
const response = await fetch('/api/rooms')
const body = await response.json()
if (!response.ok) throw new Error(body.message ?? `Request failed (${response.status})`)

// axios: reads the JSON, throws on 4xx/5xx, one place for settings (baseURL, timeout).
const { data } = await http.get<Message[]>(`/rooms/${roomId}/messages`, { signal })
```

| | fetch | axios |
| --- | --- | --- |
| install | nothing | a package |
| 404 / 500 | **not** an error: check `response.ok` | throws |
| JSON | `await response.json()` yourself | `data` is ready |
| shared settings | write a wrapper | `axios.create({ baseURL, timeout })` |
| cancel | `signal` | `signal` |
| server's error text | `body.message` | `error.response.data.message` |

`getErrorMessage(error)` picks the server's own message (like Pool's), so the user sees
"Could not load Random (fails half of the time on purpose). Try again." and not "Request failed with status 500".

**Where do API calls live?** In `api.ts`, not inside the store. The store calls them. That keeps URLs in one file
and makes tests easy (fake `api.ts`, test the store). bear-portal-new does the same (services → store/hooks).

---

## Lesson 3.3: race conditions (topic 18)

A race condition = two things running at the same time, and the **order they finish in** breaks the result.
The chat has four, each fixed differently:

### Race 1: fast room switching

Click General → Rides → General quickly. Three requests run; they answer in random order (0.3–2 s).

- **The bug we avoided by design:** if the store had ONE `messages` array for "the current room", a slow General
  answer arriving after Rides' would overwrite Rides' messages. Keying by room (`history[roomId]`) means an answer
  can only ever land in its own room.
- **Cancel what's no longer needed** (`cancelHiddenRequests`): when a room leaves the screen, its request is
  aborted and the room goes back to `idle`, so it loads fresh next time.

```ts
const controller = new AbortController()
historyRequests.set(roomId, controller)       // a tool next to the store, like the socket
await getHistory(roomId, controller.signal)   // axios stops the request when the signal is aborted
…
controller.abort()                            // later: we don't need it any more
…
catch (error) { if (isAborted(error)) return } // a cancelled request is not an error to show
```

- **Two requests for the same room:** `loadHistory` first aborts the older one for that room.

### Race 2: messages arriving while history loads

The socket can push a new message **while** the history request is on its way. When history lands we merge,
not replace:

```ts
const fetchedIds = new Set(fetched.map((message) => message.id))
room.messages = [...fetched, ...room.messages.filter((message) => !fetchedIds.has(message.id))]
```

### Race 3: leaving while connecting

Press Leave while "Connecting…": the socket may open **after** you left. `connect()` checks after the `await`:

```ts
const ws = await openSocket()
if (!get().me) { ws.close(); return } // left while we were connecting: this answer is too late
```

Rule: **after every `await`, re-check that the world is still the one you started in** (`get()` gives the latest).

### Race 4: missed messages while offline

After a reconnect, `refreshHistory()` reloads the rooms on screen and marks the others `idle`, because messages
sent while you were offline never reached you.

---

## Lesson 3.4: search with debounce (topic 17)

The server answers **short** queries slower (on purpose), so "ri" can come back after "ride": the classic search
race. `searchStore.ts` fixes it with two tools, both outside the state:

```ts
setQuery: (query) => {
  set({ query }, false, 'search/type')     // the box shows every key at once
  clearTimeout(debounceTimer)              // 1. debounce: forget the previous "wait"
  request?.abort()                         // 2. cancel the search in flight
  if (query.trim().length < 2) return set({ results: [], status: 'idle' })
  debounceTimer = setTimeout(() => void run(query.trim()), 300)
}
```

- **Debounce** = wait until typing pauses for 300 ms. Typing "ride" sends 1 request, not 4.
- **Abort** = even if an old request is still running, it's cancelled, so its late answer can never overwrite the
  newer results.

Pool does debounce differently: `useDebouncedValue` (a hook) + TanStack Query (which keeps answers per query key).
Here search is client state in a store, so the store does it. Both are fine; with TanStack Query you'd get
caching for free (see Lesson 6.2).

### Try it

Type "ride" quickly. DevTools **search**: `search/type` ×4, then one `search/start`, one `search/done`.

---

## Lesson 4.1: immer and optimistic updates (topic 22, + optimistic)

### Immer: change deep data by "mutating" a draft

Without immer, marking one message as failed (state → history → room → messages → one message) means copying every
level:

```ts
set((state) => ({
  history: {
    ...state.history,
    [roomId]: {
      ...state.history[roomId],
      messages: state.history[roomId].messages.map((m) => (m.id === id ? { ...m, delivery: 'failed' } : m)),
    },
  },
}))
```

With the `immer` middleware, `state` inside `set(fn)` is a **draft**; change it directly and immer builds the new
objects (only along the changed path):

```ts
set((state) => {
  const message = findMessage(state.history, clientId)!
  message.delivery = 'failed'
})
```

Rules: with immer, either change the draft **or** return a new object, never both; change nothing = no update.
Outside `set` (and in components) you still never mutate.

### Optimistic updates: show it before the server says yes (`messagesSlice.ts`)

```
sendMessage:  add { id: tempId, delivery: 'sending' }  → screen shows it greyed, "sending…"
              send over the socket with clientId = tempId
server OK:    { type: 'message', message, clientId }   → receiveMessage swaps the temp copy for the real one (same place)
server NO:    { type: 'sendFailed', clientId, error }  → markFailed: delivery 'failed', reason, toast, Retry button
no socket:    send() returns false                      → markFailed at once ("You're offline…")
no answer:    8 s timer                                 → markFailed ("No answer from the server.")
Retry:        delivery back to 'sending', deliver() again with the same tempId
```

Why the `clientId`: everyone gets the server's `message`, but only the sender has a temp copy with that id to
replace. Everyone else just adds it.

When to be optimistic: actions that **almost always succeed** and where waiting feels slow (sending, liking,
ticking a box). Not for payments or anything the user must trust happened.

### Try it

1. Send "hello": it's grey with "sending…" for 0.4 s, then normal.
2. Send "this will !fail": red "Not sent: Refused by the server…", a red toast, and **Retry**.
3. Stop the server and send: "You're offline…" at once. Start the server, Retry: it goes through.

---

## Lesson 4.2: middleware, persist, our own logger (topics 19, 20, 23, 24)

### What middleware is

A middleware **wraps the store recipe** and adds behaviour to `set` (or to the store) without touching your
actions. Zustand's are functions: `devtools(recipe)`, `persist(recipe, options)`.

### persist with partialize: save only drafts (`stores/chat/index.ts`)

```ts
persist(recipe, {
  name: 'pool-chat',                                    // the localStorage key
  version: 1,                                           // bump it when the saved shape changes (+ migrate)
  partialize: (state) => ({ drafts: state.drafts }),    // save ONLY this
})
```

Never save: connection status (stale after a reload), the socket, loaded messages (the server has them), anything
secret. Save: the user's own unfinished work and preferences (drafts here, `muted` in the ui store; theme in Pool).

Try it: type half a message, reload, join again: the draft is back. Application tab → Local Storage → `pool-chat`.

### Our own middleware: a logger (`stores/middleware/logger.ts`)

```ts
const loggerImpl = (recipe, name) => (set, get, store) => {
  const loggedSet = (...args) => {
    const before = get()
    set(...args)                                   // do the real change
    const after = get()
    console.log(`[${name}] ${args[2]}`, changedKeys(before, after)) // then report it
  }
  return recipe(loggedSet, get, store)            // the recipe gets OUR set instead of the real one
}
```

That's the whole idea of a middleware: hand the recipe a `set` that does a bit more. Open the console and change
your colour: `[chat] chat/updateProfile ['me']`. (The scary type at the top is copied from the Zustand docs; it
only tells TypeScript "this middleware doesn't change the store's type".)

### Combining middleware: the order matters

```ts
devtools(logger(subscribeWithSelector(persist(immer(recipe)))))
```

Read it from the inside out: immer turns draft changes into new objects → persist saves them → subscribeWithSelector
lets outside code watch one value → logger prints → devtools records. Rules of thumb:

- `devtools` **outermost**, so it sees every change from every layer (and gets the action names).
- `immer` **innermost**, so every layer above gets plain new objects.
- `persist` inside devtools, so hydration shows up in DevTools.

---

## Lesson 5.1: selectors, re-renders, subscribe (topics 25, 26, 28)

### Selectors decide who redraws

A component redraws when **what its selector returns** changes (`Object.is`).

```ts
const unread = useChatStore((state) => state.unread[room.id] ?? 0) // RoomItem: one row
```

Each `RoomItem` reads only its own count: a message in Rides redraws only the Rides row, not the list.
Patterns used in this app:

| Need | Pattern | Example |
| --- | --- | --- |
| one value | plain selector | `(s) => s.status` |
| several values | `useShallow` | Header: `status` + `leave` |
| derived object | selector function + `useShallow` | `selectStats` |
| one item of many | parameter selector | `selectHistory(roomId)` |
| "nothing yet" | a **shared** constant | `EMPTY_HISTORY`, never `?? { … }` inline |

The last row matters: `(s) => s.history[id] ?? { status: 'idle', messages: [] }` returns a **new** object every
time → React sees a change every time → endless redraws ("Maximum update depth exceeded"). One shared
`EMPTY_HISTORY` object fixes it.

Never `useChatStore()` without a selector: it redraws on **every** change (bear-portal-new's `useLoginFlow.ts`
has one; harmless on a small store, costly on this one).

### subscribe outside React (`effects.ts`)

`useChatStore.subscribe(listener)` runs on **every** change. With the `subscribeWithSelector` middleware you can
watch **one value** and also get its old value:

```ts
useChatStore.subscribe(selectTotalUnread, (total, previous) => {
  document.title = total > 0 ? `(${total}) Pool Chat` : 'Pool Chat'
  if (total > previous && !useUiStore.getState().muted) beep()
})
```

Why not a `useEffect` in a component? The title and the sound have nothing to draw, and must work whatever screen
is showing. Code that reacts to state but has no UI = an **external subscriber**. Pool's theme store does the same
(`subscribe(applyTheme)` puts the `dark` class on `<html>`).

**External subscribers work both ways:** the socket **writes into** the store from outside React; `effects.ts`
**reads out** of it. The store is the meeting point; neither side knows about the other.

### Try it

Two tabs. In tab A stay in General; in tab B send a message to Rides. Tab A: badge "1" on Rides, title
"(1) Pool Chat", and a beep (unless muted). Open Rides: the badge and title clear.

---

## Lesson 5.2: cross-tab sync with BroadcastChannel (topic 27)

`persist` saves to localStorage, but **other open tabs don't notice**; they read it only when they start.
`BroadcastChannel` sends a message to every tab of the same site:

```ts
const channel = new BroadcastChannel('pool-chat-ui')

setMuted: (muted) => {
  set({ muted }, false, 'ui/setMuted')
  channel.postMessage({ muted })               // tell the other tabs
}

channel.addEventListener('message', (event) => {
  useUiStore.setState({ muted: event.data.muted }, false, 'ui/fromOtherTab')  // NOT setMuted: no echo loop
})
```

Use it for per-user settings (mute, theme, "logged out in another tab"). Don't use it for chat data: each tab
already gets that from the server.

Try it: two tabs, click 🔔 in one: the other switches to 🔕 at once.

---

## Lesson 5.3: transient updates, and a store per component (+ topics)

### Transient updates: change the screen without a redraw (`TypingIndicator`)

"Ravi is typing…" changes often. Instead of `useChatStore(...)` (redraw each time), the component subscribes once
and writes the text straight into the element:

```ts
useEffect(() => {
  show(useChatStore.getState().typing[roomId])                     // now
  return useChatStore.subscribe((state) => state.typing[roomId], show) // on every change; unsubscribe on cleanup
}, [roomId])
```

Use it for very frequent updates (mouse position, scroll, live prices, typing). For normal data, a selector is
simpler and fast enough; don't do this everywhere.

### A store per component: `createStore` + Context (`RoomPanel.tsx`)

`create()` makes ONE store for the whole app. Sometimes each **copy of a component** needs its own: here, each room
panel has its own "replying to" message. With two panels side by side, a global `replyTo` would mix them up.

```ts
const createPanelStore = () => createStore<PanelStore>()((set) => ({ replyTo: null, setReplyTo: … }))
const PanelStoreContext = createContext<…>(null)

function RoomPanel() {
  const [panelStore] = useState(createPanelStore)  // one store per panel, made once
  return <PanelStoreContext value={panelStore}>…</PanelStoreContext>
}

function usePanelStore(selector) {
  return useStore(useContext(PanelStoreContext)!, selector) // read the NEAREST panel's store
}
```

`MessageRow` (Reply button) and `Composer` ("Replying to…") are siblings deep inside the panel: they share
`replyTo` with no props, and each panel has its own. This is the one place Zustand needs a Provider. Real uses:
a reusable widget shown many times (editors, a data grid, a form wizard), or tests that need a fresh store each time.

Try it: open Random beside General. Reply in one panel: only that panel's composer shows "Replying to…".

---

## Lesson 5.4: reset, tests, security, performance (topics 29, 30)

### Reset

`leave()` sets `{ ...CONNECTION_INITIAL, ...ROOMS_INITIAL }`: each slice exports its starting state, written once
and used twice (start + reset), so they can't drift apart. Drafts are kept on purpose. Don't forget the tools:
clear the timers, close the socket, abort requests.

### Testing stores (`stores/__tests__/`, `npm test`)

Stores are plain functions, so they're the easiest part to test: no rendering needed.

```ts
vi.mock('../../api', async (importOriginal) => ({          // fake the network…
  ...(await importOriginal<typeof import('../../api')>()),  // …keep the real helpers
  getHistory: vi.fn(),
}))

const startState = useChatStore.getState()
beforeEach(() => useChatStore.setState(startState, true))  // true = replace all: each test starts clean

it("cancels the old room's request when you switch rooms fast", () => {
  vi.mocked(getHistory).mockReturnValue(new Promise(() => {})) // never answers
  chat().openRoom('general')
  const generalSignal = vi.mocked(getHistory).mock.calls[0][1]
  chat().openRoom('rides')
  expect(generalSignal.aborted).toBe(true)
})
```

- **Fake timers** (`vi.useFakeTimers()` + `advanceTimersByTimeAsync(300)`) test debounce and toast timeouts
  without waiting.
- **happy-dom** (in `vite.config.ts`) gives the tests a fake `localStorage`, `BroadcastChannel` and `crypto`.
- Same pattern as Pool's `authStore.test.ts` and bear-portal-new's store tests (`setState` to set up, call
  actions, check `getState()`).

### Security

- **Persist nothing secret.** `partialize` saves drafts and mute only. Tokens belong in httpOnly cookies (Pool),
  not localStorage (any script on the page can read it).
- **DevTools are off in production** by default (`devtools` checks the build mode), so the state isn't exposed there.
- **Never trust the browser:** the server re-checks text length and the room, whatever the app checked.
- **No `dangerouslySetInnerHTML`:** messages are shown as text, so React escapes `<script>` someone sends.
- **Reset on leave/logout**, or the next person on the same computer sees the last one's data.

### Performance

- Selectors that pick small things (Lesson 5.1); `useShallow` for objects; per-row selectors in lists.
- Cap memory: `MAX_MESSAGES_PER_ROOM = 200`.
- Throttle chatty events: `notifyTyping` sends at most once every 2 s; search is debounced.
- Transient updates for very frequent changes.
- Keep tools (sockets, timers, controllers) out of the state: they'd trigger redraws and can't be persisted.

### Best practices (the checklist)

1. Pick the right home first (server data → TanStack Query; one component → `useState`).
2. One job per store; split a big one into slices.
3. Always read with a selector; derived values are selectors, never stored copies.
4. Change state only through `set`, inside named actions (`'rooms/open'`).
5. API calls in `api.ts`; tools next to the store; no React hooks in stores.
6. After every `await`, re-check with `get()`.
7. Name every action; `devtools` outermost, `immer` innermost.
8. Reset everything on logout. Test the actions.

---

## Lesson 6.1: slices and a folder structure that scales (topic 32)

One store had grown to ~25 fields and actions. **Slices** split the code by topic but keep **one** store (one
`getState`, one DevTools entry, actions can call each other through `get()`):

```ts
// types.ts: each slice gets the WHOLE store's set/get, and returns its own part
export type ChatSlice<T> = StateCreator<ChatStore, [/* the middleware list */], [], T>

// roomsSlice.ts
export const createRoomsSlice: ChatSlice<RoomsSlice> = (set, get) => ({ rooms: [], openRoom: …, … })

// index.ts: glue
immer((...tools) => ({
  ...createConnectionSlice(...tools),
  ...createRoomsSlice(...tools),
  ...createMessagesSlice(...tools),
}))
```

- A slice can use other slices' state and actions through `get()`: `connectionSlice` calls `get().receiveMessage`.
- The middleware list in `ChatSlice` must match the real wrapping (outermost first) so `set(…, false, 'name')` and
  immer drafts are typed correctly.
- Slices or separate stores? **Separate stores** when the data is unrelated (ui, notifications, search).
  **Slices** when it's one subject that changes together (leave resets connection AND rooms in one `set`).

### Folder structure

```
stores/
  chat/              one store, many slices (+ types, selectors, its tools)
  middleware/        shared middleware
  uiStore.ts …       small stores stay single files
  __tests__/
```

In Pool the same rules apply: app-wide stores in `src/stores/`, a module's own store inside its module
(`features/auth/authStore.ts`). bear-portal-new keeps small single-file stores (no slices needed at its size).
Don't start with slices: split when one file gets hard to read.

---

## Lesson 6.2: the complete picture, and when NOT to use Zustand (topics 31, 33)

### One message's whole journey (every lesson in one flow)

1. You type in `Composer` → `setDraft` (immer) → `persist` saves it; `notifyTyping` (throttled) → server → other
   tabs' `setTyping` → their `TypingIndicator` (transient).
2. Send → `sendMessage` adds a `sending` copy (optimistic), clears the draft → `send()` over the socket (a tool).
3. Server → `message` to every tab → `handleServerMessage` (outside React) → `receiveMessage`: swap the temp copy
   (sender) or add (others), cap at 200; not on screen? `unread++`.
4. `selectTotalUnread` changes → `effects.ts` (subscribeWithSelector) sets the title and beeps (if not muted;
   `muted` synced across tabs).
5. `RoomItem` for that room redraws its badge (per-row selector); `StatsPanel` updates (derived, `useShallow`).
6. Every step is a named action in DevTools and in the logger.

### When to use Zustand, and when not

| Use Zustand for | Don't use it for |
| --- | --- |
| client state shared by far-apart components (me, active room, sidebar) | **server data you only display**: use TanStack Query / RTK Query (cache, refetch, dedupe for free) |
| state that code outside React reads or writes (sockets, interceptors) | state one component uses (`useState`) |
| real-time data pushed by a socket | page, filters, pagination in a page app (URL: shareable, back button) |
| preferences that persist (theme, mute) | form input (TanStack Form) |
| | values you can calculate (selectors) |

Honest note about this app: rooms, history and search are **server data**. In a real project they'd be TanStack
Query (`useQuery(['history', roomId])` would give per-room caching, cancel on switch and retry for free). We did them
in Zustand to **learn** async, races and cancelling by hand. Pool's Lesson 5 (the page-size store we removed)
taught the same lesson the other way round. A common real mix: TanStack Query for server data + socket messages
written into its cache with `queryClient.setQueryData`, and Zustand only for client state (me, active room, ui).

Next: `INTERVIEW.md` (questions and answers), then `../redux-chat/LEARN.md` (Redux Toolkit, and Zustand vs RTK).
