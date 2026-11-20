import { COLOURS, type ServerMessage } from '../../protocol'
import { cancelAllHistoryRequests, ROOMS_INITIAL } from './roomsSlice'
import { openSocket, send, socketRef } from './socket'
import type { ChatSlice, ConnectionSlice, ConnectionState } from './types'

export const CONNECTION_INITIAL: ConnectionState = { me: null, status: 'idle', error: null, onlineUsers: [] }

const RETRY_MS = 2000

let retryTimer: ReturnType<typeof setTimeout> | undefined

export const createConnectionSlice: ChatSlice<ConnectionSlice> = (set, get) => {
  // Lost or failed connection: try again in a moment, as long as we're still in the chat.
  function retryLater() {
    retryTimer = setTimeout(() => {
      if (get().me) void connect()
    }, RETRY_MS)
  }

  // Used by join() and by every reconnect. It sends `me` as it is NOW, so a reconnect keeps
  // the availability and colour picked meanwhile (calling join() again would reset them).
  async function connect() {
    clearTimeout(retryTimer)
    const isReconnect = get().status === 'offline'
    set({ status: 'connecting', error: null }, false, 'chat/connecting')
    try {
      const ws = await openSocket()
      const me = get().me
      if (!me) {
        ws.close() // left while we were connecting: this answer is too late
        return
      }
      socketRef.current = ws
      ws.onmessage = (event) => handleServerMessage(JSON.parse(event.data))
      ws.onclose = () => {
        if (socketRef.current !== ws) return // closed by leave() (or replaced): nothing to do
        socketRef.current = null
        set({ status: 'offline', onlineUsers: [] }, false, 'chat/disconnected')
        retryLater()
      }
      send({ type: 'join', profile: me })
      set({ status: 'online' }, false, 'chat/connected')
      if (isReconnect) get().refreshHistory()
    } catch (error) {
      set({ status: 'offline', error: (error as Error).message }, false, 'chat/connectFailed')
      retryLater()
    }
  }

  // The server pushes these whenever it likes (outside React): hand each to the action that owns it.
  function handleServerMessage(message: ServerMessage) {
    switch (message.type) {
      case 'presence':
        set({ onlineUsers: message.users }, false, 'server/presence')
        break
      case 'message':
        get().receiveMessage(message.message, message.clientId)
        break
      case 'sendFailed':
        get().markFailed(message.clientId, message.error)
        break
      case 'typing':
        get().setTyping(message.roomId, message.name)
        break
    }
  }

  return {
    ...CONNECTION_INITIAL,

    join: async (name) => {
      const colour = COLOURS[Math.floor(Math.random() * COLOURS.length)]
      set({ me: { name, availability: 'available', colour } }, false, 'chat/join')
      // Three things at once: none waits for another.
      void get().loadRooms()
      get().openRoom(get().activeRoomId)
      await connect()
    },

    // Like a logout: stop everything and put the store back to how it started.
    // Drafts are kept on purpose (they're saved for next time).
    leave: () => {
      clearTimeout(retryTimer)
      const ws = socketRef.current
      socketRef.current = null
      ws?.close()
      cancelAllHistoryRequests()
      set({ ...CONNECTION_INITIAL, ...ROOMS_INITIAL }, false, 'chat/leave')
    },

    // My copy changes at once; the server then pushes the new list to every tab (this one too).
    // Offline? Nothing is sent, but connect() sends the latest `me` when it's back.
    updateProfile: (changes) => {
      const me = get().me
      if (!me) return
      const profile = { ...me, ...changes }
      set({ me: profile }, false, 'chat/updateProfile')
      send({ type: 'updateProfile', profile })
    },
  }
}
