import { useNotificationsStore } from '../notificationsStore'
import { isVisible } from './roomsSlice'
import { send } from './socket'
import type { ChatMessage, ChatSlice, MessagesSlice } from './types'

const MAX_MESSAGES_PER_ROOM = 200 // older ones are dropped, so a long session can't fill the memory
const NO_ANSWER_MS = 8000
const TYPING_EVERY_MS = 2000

let lastTypingSent = 0

export const createMessagesSlice: ChatSlice<MessagesSlice> = (set, get) => {
  // Send (or send again). No connection, or no answer in time → "failed", with a Retry button.
  function deliver(message: ChatMessage) {
    const sent = send({
      type: 'send',
      roomId: message.roomId,
      text: message.text,
      clientId: message.id,
      replyTo: message.replyTo,
    })
    if (!sent) {
      get().markFailed(message.id, "You're offline. Retry when the connection is back.")
      return
    }
    setTimeout(() => get().markFailed(message.id, 'No answer from the server.'), NO_ANSWER_MS)
  }

  function findMessage(history: Record<string, { messages: ChatMessage[] }>, id: string) {
    for (const room of Object.values(history)) {
      const message = room.messages.find((candidate) => candidate.id === id)
      if (message) return message
    }
    return undefined
  }

  return {
    drafts: {},

    setDraft: (roomId, text) =>
      set(
        (state) => {
          if (text) state.drafts[roomId] = text
          else delete state.drafts[roomId]
        },
        false,
        'messages/setDraft',
      ),

    // Optimistic: show the message at once as "sending…", then let the server confirm or refuse it.
    sendMessage: (roomId, replyTo) => {
      const me = get().me
      const text = (get().drafts[roomId] ?? '').trim()
      if (!me || !text) return

      const message: ChatMessage = {
        id: crypto.randomUUID(), // temporary id; the server echoes it back as `clientId`
        roomId,
        author: me,
        text,
        sentAt: new Date().toISOString(),
        replyTo,
        delivery: 'sending',
      }
      set(
        (state) => {
          state.history[roomId]?.messages.push(message)
          delete state.drafts[roomId]
        },
        false,
        'messages/send',
      )
      deliver(message)
    },

    retryMessage: (clientId) => {
      const message = findMessage(get().history, clientId)
      if (message?.delivery !== 'failed') return
      set(
        (state) => {
          const draft = findMessage(state.history, clientId)!
          draft.delivery = 'sending'
          delete draft.failReason
        },
        false,
        'messages/retry',
      )
      deliver(message)
    },

    // From the server, for everyone's messages (mine included: then `clientId` matches my temporary copy).
    receiveMessage: (message, clientId) =>
      set(
        (state) => {
          const room = state.history[message.roomId]
          if (room) {
            const mine = room.messages.findIndex((candidate) => candidate.id === clientId)
            const alreadyThere = room.messages.some((candidate) => candidate.id === message.id)
            if (mine >= 0 && alreadyThere) room.messages.splice(mine, 1)
            else if (mine >= 0)
              room.messages[mine] = message // swap "sending…" for the real one, same place
            else if (!alreadyThere) room.messages.push(message)
            if (room.messages.length > MAX_MESSAGES_PER_ROOM)
              room.messages.splice(0, room.messages.length - MAX_MESSAGES_PER_ROOM)
          }
          if (!isVisible(state, message.roomId) && message.author.name !== state.me?.name) {
            state.unread[message.roomId] = (state.unread[message.roomId] ?? 0) + 1
          }
        },
        false,
        'server/message',
      ),

    markFailed: (clientId, reason) => {
      if (findMessage(get().history, clientId)?.delivery !== 'sending') return // already confirmed: nothing to do
      set(
        (state) => {
          const message = findMessage(state.history, clientId)!
          message.delivery = 'failed'
          message.failReason = reason
        },
        false,
        'messages/failed',
      )
      // One store calling another: fine from an action (outside React), through getState().
      useNotificationsStore.getState().notify(`Message not sent: ${reason}`, 'error')
    },

    // Called on every key press; tells the server at most once every 2 s.
    notifyTyping: (roomId) => {
      if (Date.now() - lastTypingSent < TYPING_EVERY_MS) return
      lastTypingSent = Date.now()
      send({ type: 'typing', roomId })
    },
  }
}
