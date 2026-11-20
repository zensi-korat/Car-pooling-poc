# Pool Chat (Redux): the same chat with Redux Toolkit (Phase 7, topics 35–41)

A smaller copy of `../zustand-chat`: join, online list, rooms, history, sending, search. It talks to the **same
server** and uses the same `protocol.ts` types, so you can compare the two apps file by file.

## Run it

```
cd ../zustand-chat && npm run server   # the shared server (port 4000)
npm run dev                            # this app (in redux-chat)
```

Open it next to the Zustand app: messages flow between the two.

## Files

| Redux file | Same job in zustand-chat |
| --- | --- |
| `src/store/index.ts`: `configureStore`, typed hooks | `stores/chat/index.ts`: `create()` + middleware |
| `src/store/connectionSlice.ts`: `createSlice` | `connectionSlice.ts` |
| `src/store/historySlice.ts`: `createSlice` + `createAsyncThunk` | `roomsSlice.ts` → `loadHistory` |
| `src/store/socketMiddleware.ts`: a Redux middleware | `socket.ts` + `handleServerMessage` |
| `src/store/chatApi.ts`: RTK Query | `api.ts` + `searchStore.ts` + `loadRooms` |
| `src/main.tsx`: `<Provider store={store}>` | nothing (Zustand needs no Provider) |

---

## 36. Why Redux Toolkit exists

Redux is the oldest big React state library: **one store**, state changed only by **dispatching actions**
(plain objects like `{ type: 'connection/joined', payload: 'Asha' }`) that **reducers** turn into the next state.
Predictable and great tooling, but classic Redux needed a lot of hand-written code: action type constants, action
creators, switch statements, copying nested objects by hand, extra libraries for async.

**Redux Toolkit (RTK)** is the official, modern way to write Redux. It removes that boilerplate:
`configureStore` (good defaults, DevTools on), `createSlice` (reducers + actions in one, immer built in),
`createAsyncThunk` (async), and RTK Query (data fetching). Today "Redux" means RTK.

## 37. Store, slices, reducers, actions

```ts
export const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    joined: (state, action: PayloadAction<string>) => {   // a reducer: (state, action) → next state
      state.me = { name: action.payload, … }               // "mutating" is fine: immer is built in
      state.status = 'connecting'
    },
    left: () => initialState,                              // reset = return the initial state
  },
})
export const { joined, left } = connectionSlice.actions    // action creators, made for you
```

```ts
const store = configureStore({ reducer: { connection: connectionSlice.reducer, history: historySlice.reducer, … } })
```

In a component:

```ts
const me = useAppSelector((state) => state.connection.me)  // like useChatStore((s) => s.me)
const dispatch = useAppDispatch()
dispatch(joined('Asha'))                                    // like useChatStore.getState().join('Asha')
```

Big difference: in Zustand an action **is** a function that changes state. In Redux an action is a **message**
("this happened"), and **every** slice may react to it. `historySlice` resets itself on `connection/left`:

```ts
extraReducers: (builder) => builder.addCase(left, () => initialState)
```

`useAppSelector` / `useAppDispatch` are the typed versions (`useSelector.withTypes<RootState>()`), made once in
`store/index.ts`. Selectors work like Zustand's: the component redraws when the selected value changes.

## 38. createAsyncThunk

Reducers must be pure and synchronous. Async work goes into a **thunk**:

```ts
export const fetchHistory = createAsyncThunk('history/fetch', async (roomId, { signal, rejectWithValue }) => {
  const response = await fetch(`/api/rooms/${roomId}/messages`, { signal })
  const body = await response.json()
  if (!response.ok) return rejectWithValue(body.message)    // the server's own message
  return body
}, { condition: (roomId, { getState }) => getState().history.byRoom[roomId]?.status !== 'success' })
```

It dispatches three actions automatically, handled in `extraReducers`:
`history/fetch/pending` → loading · `/fulfilled` → messages · `/rejected` → error (or `idle` if aborted).

**Races** are handled with the request id RTK gives every call: `pending` remembers it, and `fulfilled`/`rejected`
ignore answers from older requests (`room.requestId !== action.meta.requestId`). **Cancel** is built in:

```ts
useEffect(() => {
  const request = dispatch(fetchHistory(roomId))
  return () => request.abort()     // leaving the room aborts it (the signal reaches fetch)
}, [dispatch, roomId])
```

Compare Zustand's `loadHistory`: the same steps, written as one ordinary `async` function with an
`AbortController` kept next to the store.

## 39. Middleware and Redux DevTools

A Redux middleware sits between `dispatch` and the reducers and sees **every action**:

```ts
export const socketMiddleware: Middleware = (store) => {
  let socket: WebSocket | null = null                 // the tool lives in the middleware
  return (next) => (action) => {
    const result = next(action)                       // reducers run
    if (joined.match(action)) { /* open the socket; server messages → store.dispatch(...) */ }
    if (left.match(action)) { socket?.close() }
    if (sendMessage.match(action)) { send(...) }
    return result
  }
}
```

This is where Redux apps put sockets, analytics and logging. (RTK also has `createListenerMiddleware` for "when X
happens, do Y".) Zustand middleware is different: it wraps the **store's `set`** (like `logger.ts`), not a stream of
actions.

**Redux DevTools** are on by default with `configureStore`: every action, the state after it, and time travel. In
Zustand you get the same view with the `devtools` middleware and named `set` calls.

## 40. RTK Query

The data-fetching part of RTK (Redux's TanStack Query):

```ts
export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (build) => ({
    getRooms: build.query<Room[], void>({ query: () => '/rooms' }),
    searchMessages: build.query<Message[], string>({ query: (q) => ({ url: '/search', params: { q } }) }),
  }),
})
// component:
const { data: rooms = [], isLoading, error, refetch } = useGetRoomsQuery()
const { currentData, isFetching } = useSearchMessagesQuery(debounced, { skip: debounced.length < 2 })
```

You get loading/error flags, caching (one entry per query argument), de-duplication and refetch, with no reducer
code. The search race from `zustand-chat` (Lesson 3.4) disappears: `currentData` is always the answer for the
**current** query. Compare the ~70 lines of `searchStore.ts`. That's why server data belongs in a query library,
whichever one you use. History could be an RTK Query endpoint too; it's a thunk here only to learn `createAsyncThunk`.

## 35 / 41. Zustand vs Redux Toolkit

| | Zustand | Redux Toolkit |
| --- | --- | --- |
| Setup | `create()`; no Provider | `configureStore` + `<Provider>` + typed hooks |
| Change state | call an action function → `set` | `dispatch(action)` → reducers |
| Actions | functions | messages; every slice can react to any action |
| Immutable updates | spread, or the immer middleware | immer built in |
| Async | `async` action | `createAsyncThunk` (pending/fulfilled/rejected) |
| Side effects (sockets) | in actions / tools next to the store | middleware or listener middleware |
| Server data | do it yourself, or TanStack Query | RTK Query (built in) |
| DevTools | `devtools` middleware + named `set` | built in |
| Outside React | `getState` / `setState` / `subscribe` | `store.getState()` / `store.dispatch` |
| Many stores | normal (one per job) | one store, many slices |
| Code size | small | more, but more uniform |
| Best for | small/medium apps, little ceremony | large teams wanting enforced patterns, apps already on Redux |

**In real projects:** bear-portal-new and Pool use Zustand for a few client-state stores + TanStack Query for server
data. Many larger/older codebases use RTK + RTK Query. The important skill is the same in both: put server data in
a query library, client state in a store, and URL/form/local state where they belong.

## Try it

1. Join as "Ravi" here and "Asha" in the Zustand app: you see each other online and in messages.
2. Redux DevTools (pick "Pool Chat (Redux)"): `connection/joined`, `history/fetch/pending` →
   `/fulfilled`, `chatApi/executeQuery/...`.
3. Switch rooms quickly (General → Rides → General): aborted requests show as `history/fetch/rejected` with `aborted: true`.
4. Type "ride" in search: one request after the pause; DevTools shows the RTK Query cache entry per query.
