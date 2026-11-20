import type { StateCreator } from 'zustand'
import type { Message, Profile, Room } from '../../protocol'

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

// ---------- connection ----------

export type ConnectionStatus = 'idle' | 'connecting' | 'online' | 'offline'

export type ConnectionState = {
  me: Profile | null // my own profile; null = not in the chat
  status: ConnectionStatus
  error: string | null
  onlineUsers: Profile[]
}

export type ConnectionSlice = ConnectionState & {
  join: (name: string) => Promise<void>
  leave: () => void
  updateProfile: (changes: Partial<Omit<Profile, 'name'>>) => void
}

// ---------- rooms ----------

// `delivery` only exists on my own messages until the server confirms them (optimistic updates).
export type ChatMessage = Message & { delivery?: 'sending' | 'failed'; failReason?: string }

export type RoomHistory = { status: LoadStatus; messages: ChatMessage[]; error: string | null }

export type RoomsState = {
  rooms: Room[]
  roomsStatus: LoadStatus
  roomsError: string | null
  activeRoomId: string
  sideRoomId: string | null // a second room shown beside the active one
  history: Record<string, RoomHistory> // one entry per room, so rooms never overwrite each other
  unread: Record<string, number>
  typing: Record<string, string[]> // roomId → names typing right now
}

export type RoomsSlice = RoomsState & {
  loadRooms: () => Promise<void>
  openRoom: (roomId: string) => void
  openBeside: (roomId: string) => void
  closeBeside: () => void
  loadHistory: (roomId: string) => Promise<void>
  refreshHistory: () => void
  setTyping: (roomId: string, name: string) => void
}

// ---------- messages ----------

export type MessagesSlice = {
  drafts: Record<string, string> // roomId → unsent text (saved in localStorage)
  setDraft: (roomId: string, text: string) => void
  sendMessage: (roomId: string, replyTo: Message['replyTo']) => void
  retryMessage: (clientId: string) => void
  receiveMessage: (message: Message, clientId: string) => void
  markFailed: (clientId: string, reason: string) => void
  notifyTyping: (roomId: string) => void
}

export type ChatStore = ConnectionSlice & RoomsSlice & MessagesSlice

// The type of one slice: it gets the WHOLE store's set/get, and returns its own part.
// The list names the middleware around it, outermost first (logger adds no types, so it isn't listed).
export type ChatSlice<T> = StateCreator<
  ChatStore,
  [
    ['zustand/devtools', never],
    ['zustand/subscribeWithSelector', never],
    ['zustand/persist', unknown],
    ['zustand/immer', never],
  ],
  [],
  T
>
