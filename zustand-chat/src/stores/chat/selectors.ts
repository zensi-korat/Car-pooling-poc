import type { ChatStore, RoomHistory } from './types'

// Derived values: calculated from the state when read, never stored (a stored copy could go out of date).

// One shared "nothing yet" object. Returning a NEW `{…}` from a selector on every call would make
// React think the value changed every time, and loop forever.
const EMPTY_HISTORY: RoomHistory = { status: 'idle', messages: [], error: null }
const NOBODY: string[] = []

export const selectHistory = (roomId: string) => (state: ChatStore) => state.history[roomId] ?? EMPTY_HISTORY

export const selectTyping = (roomId: string) => (state: ChatStore) => state.typing[roomId] ?? NOBODY

export function selectTotalUnread(state: ChatStore): number {
  return Object.values(state.unread).reduce((sum, count) => sum + count, 0)
}

// A new object every call: read it with useShallow, which compares the fields one by one.
export function selectStats(state: ChatStore) {
  const loaded = Object.values(state.history).flatMap((room) => room.messages)
  return {
    online: state.onlineUsers.length,
    rooms: state.rooms.length,
    loadedMessages: loaded.length,
    sentByMe: loaded.filter((message) => message.author.name === state.me?.name).length,
    unread: selectTotalUnread(state),
    drafts: Object.keys(state.drafts).length,
  }
}
