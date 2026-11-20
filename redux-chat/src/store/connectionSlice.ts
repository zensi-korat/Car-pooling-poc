import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Profile } from '../protocol'

export type ConnectionState = {
  me: Profile | null
  status: 'idle' | 'connecting' | 'online' | 'offline'
  onlineUsers: Profile[]
}

const initialState: ConnectionState = { me: null, status: 'idle', onlineUsers: [] }

// createSlice = state + reducers + action creators in one place. Reducers may "mutate" (immer is built in).
export const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    joined: (state, action: PayloadAction<string>) => {
      state.me = { name: action.payload, availability: 'available', colour: 'sky' }
      state.status = 'connecting'
    },
    connected: (state) => {
      state.status = 'online'
    },
    disconnected: (state) => {
      state.status = 'offline'
      state.onlineUsers = []
    },
    presenceReceived: (state, action: PayloadAction<Profile[]>) => {
      state.onlineUsers = action.payload
    },
    left: () => initialState,
  },
})

export const { joined, connected, disconnected, presenceReceived, left } = connectionSlice.actions
