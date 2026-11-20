// A tiny chat server for learning. Run it with `npm run server` (Node runs TypeScript directly).
// Slow answers and failures are on purpose: the app has to handle them (lessons 3.x and 4.1).
import { randomUUID } from 'node:crypto'
import { createServer, type ServerResponse } from 'node:http'
import { WebSocketServer, type WebSocket } from 'ws'
import type { ClientMessage, Message, Profile, Room, ServerMessage } from '../src/protocol.ts'

const PORT = 4000
const MAX_TEXT = 500

const ROOMS: Room[] = [
  { id: 'general', name: 'General' },
  { id: 'rides', name: 'Ride requests' },
  { id: 'random', name: 'Random (flaky)' },
]

const ASHA: Profile = { name: 'Asha', availability: 'available', colour: 'emerald' }
const RAVI: Profile = { name: 'Ravi', availability: 'busy', colour: 'sky' }

function newMessage(roomId: string, author: Profile, text: string, replyTo: Message['replyTo'] = null): Message {
  return { id: randomUUID(), roomId, author, text, sentAt: new Date().toISOString(), replyTo }
}

const messages = new Map<string, Message[]>([
  [
    'general',
    [newMessage('general', ASHA, 'Hi everyone 👋'), newMessage('general', RAVI, 'Morning! Who is driving today?')],
  ],
  ['rides', [newMessage('rides', RAVI, 'Need a ride from Satellite to SG Highway at 9:00')]],
  ['random', [newMessage('random', ASHA, 'This room fails to load half of the time. Press Retry.')]],
])

// One entry per open browser tab: the socket and that tab's profile.
const profiles = new Map<WebSocket, Profile>()

// ---------- HTTP: rooms, history, search ----------

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function json(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { 'Content-Type': 'application/json' }).end(JSON.stringify(body))
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost')

  if (url.pathname === '/api/rooms') {
    await wait(300)
    return json(response, 200, ROOMS)
  }

  const history = url.pathname.match(/^\/api\/rooms\/([^/]+)\/messages$/)
  if (history) {
    const roomId = history[1]
    await wait(300 + Math.random() * 1700) // 0.3–2 s: switch rooms fast and answers arrive out of order
    if (!messages.has(roomId)) return json(response, 404, { message: `Room "${roomId}" not found` })
    if (roomId === 'random' && Math.random() < 0.5) {
      return json(response, 500, { message: 'Could not load Random (fails half of the time on purpose). Try again.' })
    }
    return json(response, 200, messages.get(roomId)!.slice(-50))
  }

  if (url.pathname === '/api/search') {
    const query = (url.searchParams.get('q') ?? '').trim().toLowerCase()
    // Shorter queries answer SLOWER, so "ri" can arrive after "ride": the race lesson 3.4 fixes.
    await wait(Math.max(100, 1500 - query.length * 300))
    const found = [...messages.values()].flat().filter((message) => message.text.toLowerCase().includes(query))
    return json(response, 200, query ? found.toReversed().slice(0, 20) : [])
  }

  json(response, 404, { message: 'Not found' })
})

// ---------- WebSocket: presence, messages, typing ----------

const sockets = new WebSocketServer({ server, path: '/ws' })

// Push a message to every open tab (nobody asked for it: that's the "real-time" part).
function broadcast(message: ServerMessage, except?: WebSocket) {
  const text = JSON.stringify(message)
  for (const client of sockets.clients) {
    if (client !== except && client.readyState === client.OPEN) client.send(text)
  }
}

function reply(socket: WebSocket, message: ServerMessage) {
  socket.send(JSON.stringify(message))
}

function sendPresence() {
  // The same name in two tabs is one person: keep one entry per name (the latest wins).
  const byName = new Map([...profiles.values()].map((profile) => [profile.name, profile]))
  broadcast({ type: 'presence', users: [...byName.values()].sort((a, b) => a.name.localeCompare(b.name)) })
}

sockets.on('connection', (socket) => {
  socket.on('message', async (raw) => {
    let message: ClientMessage
    try {
      message = JSON.parse(String(raw))
    } catch {
      return // not JSON: ignore it
    }

    if (message.type === 'join' || message.type === 'updateProfile') {
      profiles.set(socket, message.profile)
      sendPresence()
      return
    }

    const profile = profiles.get(socket)
    if (!profile) return // must join first

    if (message.type === 'typing') {
      broadcast({ type: 'typing', roomId: message.roomId, name: profile.name }, socket)
      return
    }

    if (message.type === 'send') {
      await wait(400) // long enough to see "sending…"
      const text = message.text.trim()
      // Never trust the browser: the server checks again, whatever the app already checked.
      const error = !messages.has(message.roomId)
        ? 'That room does not exist.'
        : text.length === 0 || text.length > MAX_TEXT
          ? `Messages must be 1–${MAX_TEXT} characters.`
          : text.includes('!fail')
            ? 'Refused by the server (messages containing !fail always fail, for practice).'
            : null
      if (error) return reply(socket, { type: 'sendFailed', clientId: message.clientId, error })

      const saved = newMessage(message.roomId, profile, text, message.replyTo)
      messages.get(message.roomId)!.push(saved)
      broadcast({ type: 'message', message: saved, clientId: message.clientId })
    }
  })

  // The tab closed, refreshed, or lost its connection.
  socket.on('close', () => {
    profiles.delete(socket)
    sendPresence()
  })
})

server.listen(PORT, () => console.log(`Chat server: http://localhost:${PORT}  (WebSocket at /ws)`))
