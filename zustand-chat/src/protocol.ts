// Every shape the browser and the server share. Both sides import this file.

export const AVAILABILITIES = ['available', 'busy', 'away'] as const
export const COLOURS = ['rose', 'sky', 'emerald', 'amber', 'violet'] as const

export type Availability = (typeof AVAILABILITIES)[number]
export type Colour = (typeof COLOURS)[number]
export type Profile = { name: string; availability: Availability; colour: Colour }

export type Room = { id: string; name: string }

export type Message = {
  id: string
  roomId: string
  author: Profile // a copy of the profile at the moment it was sent
  text: string
  sentAt: string // ISO date-time
  replyTo: { author: string; text: string } | null
}

// browser → server
export type ClientMessage =
  | { type: 'join'; profile: Profile }
  | { type: 'updateProfile'; profile: Profile }
  | { type: 'send'; roomId: string; text: string; clientId: string; replyTo: Message['replyTo'] }
  | { type: 'typing'; roomId: string }

// server → browser
export type ServerMessage =
  | { type: 'presence'; users: Profile[] }
  | { type: 'message'; message: Message; clientId: string } // clientId: lets the sender match its optimistic copy
  | { type: 'sendFailed'; clientId: string; error: string }
  | { type: 'typing'; roomId: string; name: string }
