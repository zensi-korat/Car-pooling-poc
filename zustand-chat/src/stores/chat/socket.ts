import type { ClientMessage } from '../../protocol'

// The open connection is a tool, not data to show, so it lives here and not in the store
// (it can't be saved, can't be shown in DevTools, and no component draws it).
// An object with `current` (like useRef) so other files can replace the socket.
export const socketRef: { current: WebSocket | null } = { current: null }

// WebSocket reports through events (onopen / onerror). A Promise turns that into something we can `await`.
export function openSocket(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${location.origin.replace(/^http/, 'ws')}/ws`)
    ws.onopen = () => resolve(ws)
    ws.onerror = () => reject(new Error('Could not reach the chat server. Is `npm run server` running?'))
  })
}

// Returns false when there is no open connection (the caller decides what that means).
export function send(message: ClientMessage): boolean {
  const ws = socketRef.current
  if (ws?.readyState !== WebSocket.OPEN) return false
  ws.send(JSON.stringify(message))
  return true
}
