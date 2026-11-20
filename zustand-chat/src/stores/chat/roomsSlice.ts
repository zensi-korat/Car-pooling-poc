import { getErrorMessage, getHistory, getRooms, isAborted } from '../../api'
import type { ChatSlice, RoomsSlice, RoomsState } from './types'

export const ROOMS_INITIAL: RoomsState = {
  rooms: [],
  roomsStatus: 'idle',
  roomsError: null,
  activeRoomId: 'general',
  sideRoomId: null,
  history: {},
  unread: {},
  typing: {},
}

const TYPING_SHOWN_MS = 3000

// Tools, not data: one AbortController per room whose history is loading, and the typing timers.
const historyRequests = new Map<string, AbortController>()
const typingTimers = new Map<string, ReturnType<typeof setTimeout>>()

export function cancelAllHistoryRequests() {
  for (const controller of historyRequests.values()) controller.abort()
  historyRequests.clear()
}

export function isVisible(state: RoomsState, roomId: string): boolean {
  return roomId === state.activeRoomId || roomId === state.sideRoomId
}

export const createRoomsSlice: ChatSlice<RoomsSlice> = (set, get) => {
  // Load a room's history unless it's already there or on its way.
  function ensureHistory(roomId: string) {
    const status = get().history[roomId]?.status
    if (status !== 'success' && status !== 'loading') void get().loadHistory(roomId)
  }

  // Switched away before the answer came: cancel it (saves work) and mark the room "not loaded".
  function cancelHiddenRequests() {
    for (const [roomId, controller] of historyRequests) {
      if (isVisible(get(), roomId)) continue
      controller.abort()
      historyRequests.delete(roomId)
      set(
        (state) => {
          state.history[roomId].status = 'idle'
        },
        false,
        'rooms/loadCancelled',
      )
    }
  }

  return {
    ...ROOMS_INITIAL,

    loadRooms: async () => {
      set({ roomsStatus: 'loading', roomsError: null }, false, 'rooms/load')
      try {
        const rooms = await getRooms()
        set({ rooms, roomsStatus: 'success' }, false, 'rooms/loaded')
      } catch (error) {
        set({ roomsStatus: 'error', roomsError: getErrorMessage(error) }, false, 'rooms/loadFailed')
      }
    },

    openRoom: (roomId) => {
      set(
        (state) => {
          state.activeRoomId = roomId
          delete state.unread[roomId]
          if (state.sideRoomId === roomId) state.sideRoomId = null
        },
        false,
        'rooms/open',
      )
      cancelHiddenRequests()
      ensureHistory(roomId)
    },

    openBeside: (roomId) => {
      if (roomId === get().activeRoomId) return
      set(
        (state) => {
          state.sideRoomId = roomId
          delete state.unread[roomId]
        },
        false,
        'rooms/openBeside',
      )
      cancelHiddenRequests()
      ensureHistory(roomId)
    },

    closeBeside: () => {
      set({ sideRoomId: null }, false, 'rooms/closeBeside')
      cancelHiddenRequests()
    },

    loadHistory: async (roomId) => {
      historyRequests.get(roomId)?.abort() // an older request for this room is still running: its answer is out of date
      const controller = new AbortController()
      historyRequests.set(roomId, controller)

      set(
        (state) => {
          const room = (state.history[roomId] ??= { status: 'idle', messages: [], error: null })
          room.status = 'loading'
          room.error = null
        },
        false,
        'rooms/loadHistory',
      )

      try {
        const fetched = await getHistory(roomId, controller.signal)
        set(
          (state) => {
            const room = state.history[roomId]
            // Keep what arrived over the socket while we waited (and my unsent messages), without duplicates.
            const fetchedIds = new Set(fetched.map((message) => message.id))
            room.messages = [...fetched, ...room.messages.filter((message) => !fetchedIds.has(message.id))]
            room.status = 'success'
          },
          false,
          'rooms/historyLoaded',
        )
      } catch (error) {
        if (isAborted(error)) return // we cancelled it on purpose: not an error
        set(
          (state) => {
            state.history[roomId].status = 'error'
            state.history[roomId].error = getErrorMessage(error)
          },
          false,
          'rooms/historyFailed',
        )
      } finally {
        if (historyRequests.get(roomId) === controller) historyRequests.delete(roomId)
      }
    },

    // After a reconnect we may have missed messages: reload the rooms on screen, and mark the others
    // "not loaded" so they reload when opened.
    refreshHistory: () => {
      set(
        (state) => {
          for (const roomId of Object.keys(state.history)) {
            if (!isVisible(state, roomId)) state.history[roomId].status = 'idle'
          }
        },
        false,
        'rooms/refresh',
      )
      for (const roomId of Object.keys(get().history)) {
        if (isVisible(get(), roomId)) void get().loadHistory(roomId)
      }
    },

    setTyping: (roomId, name) => {
      const key = `${roomId}:${name}`
      clearTimeout(typingTimers.get(key))
      set(
        (state) => {
          const names = (state.typing[roomId] ??= [])
          if (!names.includes(name)) names.push(name)
        },
        false,
        'server/typing',
      )
      typingTimers.set(
        key,
        setTimeout(() => {
          typingTimers.delete(key)
          set(
            (state) => {
              state.typing[roomId] = (state.typing[roomId] ?? []).filter((typingName) => typingName !== name)
            },
            false,
            'rooms/typingStopped',
          )
        }, TYPING_SHOWN_MS),
      )
    },
  }
}
