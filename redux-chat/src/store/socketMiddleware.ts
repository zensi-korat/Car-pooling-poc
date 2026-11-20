import type { Middleware } from '@reduxjs/toolkit'
import type { ClientMessage, ServerMessage } from '../protocol'
import { connected, disconnected, joined, left, presenceReceived, type ConnectionState } from './connectionSlice'
import { messageReceived, sendMessage } from './historySlice'

// A Redux middleware sees EVERY action before (and after) the reducers. Here it owns the WebSocket:
// some actions open/close/use it, and messages from the server become actions.
// (zustand-chat does the same job inside its actions, with the socket in a plain variable.)
export const socketMiddleware: Middleware<object, { connection: ConnectionState }> = (store) => {
  let socket: WebSocket | null = null

  function send(message: ClientMessage) {
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message))
  }

  return (next) => (action) => {
    const result = next(action) // let the reducers run first

    if (joined.match(action)) {
      const ws = new WebSocket(`${location.origin.replace(/^http/, 'ws')}/ws`)
      socket = ws
      ws.onopen = () => {
        const me = store.getState().connection.me
        if (me) send({ type: 'join', profile: me })
        store.dispatch(connected())
      }
      ws.onmessage = (event) => {
        const message: ServerMessage = JSON.parse(event.data)
        if (message.type === 'presence') store.dispatch(presenceReceived(message.users))
        if (message.type === 'message') store.dispatch(messageReceived(message.message))
      }
      ws.onclose = () => {
        if (socket !== ws) return
        socket = null
        store.dispatch(disconnected())
      }
    }

    if (left.match(action)) {
      const ws = socket
      socket = null
      ws?.close()
    }

    if (sendMessage.match(action)) {
      send({ type: 'send', ...action.payload, clientId: crypto.randomUUID(), replyTo: null })
    }

    return result
  }
}
