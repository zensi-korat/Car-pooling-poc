# Zustand curriculum: where each topic is learned

Every topic is covered. "Lesson" = the section in `LEARN.md` (Phase 7: `../redux-chat/LEARN.md`).
Places: **Pool** = the main app (`src/`) · **Cart** = `zustand-practice/` · **Chat** = this folder ·
**RTK** = `redux-chat/`.

## Phase 1: Fundamentals

| # | Topic | Lesson | Where in the code |
| --- | --- | --- | --- |
| 1 | What state management is, and why | 1 | Pool `LEARN-zustand.md` §1 |
| 2 | What problems Zustand solves | 1 | Pool theme + auth moved from Context to Zustand |
| 3 | Local state vs Context vs Zustand | 1, 2.2 | `JoinScreen` (useState) · `RoomPanel` (Context) · `uiStore` |
| 4 | What a store is | 1 | `stores/uiStore.ts` |
| 5 | `create()` | 1 | every store |
| 6 | state, `set`, `get` | 1, 2.1 | `updateProfile` (get + set) · Cart `checkout` |

## Phase 2: Real-world stores

| # | Topic | Lesson | Where in the code |
| --- | --- | --- | --- |
| 7 | Authentication and profile | 2.1 | Chat `me: Profile` · Pool `authStore.ts` |
| 8 | Sharing the user across components | 2.1 | `useMe()` · Pool `useCurrentUser()` |
| 9 | Updating the profile | 2.1 | `updateProfile` → every tab |
| 10 | App-wide UI state | 2.2 | `activeRoomId`, `sideRoomId` · `uiStore` sidebar |
| 11 | Cart, filters, notifications, dashboards | 2.2, 2.3 | Cart · room filter (useState, and why) · `notificationsStore` · `StatsPanel` |
| 12 | Multiple stores and organisation | 2.3 | chat + ui + notifications + search |

## Phase 3: Async

| # | Topic | Lesson | Where in the code |
| --- | --- | --- | --- |
| 13 | Sync vs async state | 3.1 | `openRoom` vs `loadHistory` |
| 14 | async/await in Zustand | 1, 3.1 | `connect`, `loadRooms`, `loadHistory` |
| 15 | API calls with fetch and Axios | 3.2 | `api.ts` (`getRooms` fetch, `getHistory` axios) |
| 16 | Loading, success, error states | 3.1 | `history[roomId].status` · `MessageList` |
| 17 | Search with debounce | 3.4 | `searchStore.ts` |
| 18 | API failures and race conditions | 3.2, 3.3 | Random room + Retry · AbortController · re-check after await · merge |

## Phase 4: Middleware

| # | Topic | Lesson | Where in the code |
| --- | --- | --- | --- |
| 19 | What middleware is | 4.2 | `middleware/logger.ts` |
| 20 | persist | 4.2 | drafts (`partialize`, `version`) · `uiStore` mute · Pool theme |
| 21 | devtools | all | every store, named actions |
| 22 | immer | 4.1 | `messagesSlice`, `roomsSlice` |
| 23 | Writing your own middleware | 4.2 | `logger.ts` |
| 24 | Combining middleware (order) | 4.2 | `stores/chat/index.ts` |

## Phase 5: Advanced

| # | Topic | Lesson | Where in the code |
| --- | --- | --- | --- |
| 25 | Selectors, avoiding re-renders | 5.1 | `RoomItem` per-row selector · `useShallow` · `EMPTY_HISTORY` |
| 26 | `subscribe` and `subscribeWithSelector` | 5.1 | `effects.ts` |
| 27 | Cross-tab sync with BroadcastChannel | 5.2 | `uiStore.ts` |
| 28 | External subscribers | 5.1 | socket writes in · `effects.ts` reads out |
| 29 | Resetting stores and testing | 5.4 | `leave()` · `stores/__tests__/` (14 tests) |
| 30 | Security, performance, best practices | 5.4 | partialize, caps, throttling, checklist |
| + | Optimistic updates | 4.1 | `sendMessage` / `receiveMessage` / `markFailed` / `retryMessage` |
| + | A store per component (`createStore` + Context) | 5.3 | `RoomPanel.tsx` reply-to store |
| + | Transient updates | 5.3 | `TypingIndicator` |

## Phase 6: Real project and interviews

| # | Topic | Lesson | Where in the code |
| --- | --- | --- | --- |
| 31 | A complete feature | 6.2 | "One message's whole journey" |
| 32 | Folder structure that scales (slices) | 6.1 | `stores/chat/` |
| 33 | When to use Zustand, and when not | 6.2 | table + Pool Lesson 5 |
| 34 | Interview questions | – | `INTERVIEW.md` |
| 35 | Zustand vs Redux Toolkit | RTK | `../redux-chat/LEARN.md` (table) |

## Phase 7: Redux Toolkit

| # | Topic | Where |
| --- | --- | --- |
| 36 | Why Redux Toolkit exists | RTK LEARN §36 |
| 37 | Store, slices, reducers, actions | `store/index.ts`, `connectionSlice.ts` |
| 38 | `createAsyncThunk` | `historySlice.ts` `fetchHistory` |
| 39 | Middleware and Redux DevTools | `socketMiddleware.ts` |
| 40 | RTK Query | `chatApi.ts` (rooms, search) |
| 41 | Zustand vs RTK in real projects | RTK LEARN §35/41 |
