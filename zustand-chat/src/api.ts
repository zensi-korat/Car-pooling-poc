import axios from 'axios'
import type { Message, Room } from './protocol'

// fetch: built into the browser. It does NOT throw on 404/500, so check `ok` yourself, and read the JSON yourself.
export async function getRooms(): Promise<Room[]> {
  const response = await fetch('/api/rooms')
  const body = await response.json()
  if (!response.ok) throw new Error(body.message ?? `Request failed (${response.status})`)
  return body
}

// axios: reads the JSON for you, throws on 4xx/5xx, and has one place for shared settings.
const http = axios.create({ baseURL: '/api', timeout: 10_000 })

export async function getHistory(roomId: string, signal: AbortSignal): Promise<Message[]> {
  const { data } = await http.get<Message[]>(`/rooms/${roomId}/messages`, { signal })
  return data
}

export async function searchMessages(query: string, signal: AbortSignal): Promise<Message[]> {
  const { data } = await http.get<Message[]>('/search', { params: { q: query }, signal })
  return data
}

// The server's own message when there is one (like Pool's getErrorMessage).
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) return error.response?.data?.message ?? error.message
  return error instanceof Error ? error.message : 'Something went wrong'
}

// A request we cancelled ourselves is not an error to show.
export function isAborted(error: unknown): boolean {
  return axios.isCancel(error) || (error instanceof DOMException && error.name === 'AbortError')
}
