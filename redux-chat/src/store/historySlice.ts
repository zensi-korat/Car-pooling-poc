import { createAction, createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Message } from '../protocol'
import { left } from './connectionSlice'

type RoomHistory = {
  status: 'idle' | 'loading' | 'success' | 'error'
  messages: Message[]
  error: string | null
  requestId: string | null // the request whose answer we're waiting for (older answers are ignored)
}

type HistoryState = { activeRoomId: string; byRoom: Record<string, RoomHistory> }

const initialState: HistoryState = { activeRoomId: 'general', byRoom: {} }

// An action with no reducer here: the socket middleware turns it into a WebSocket message.
export const sendMessage = createAction<{ roomId: string; text: string }>('history/sendMessage')

// createAsyncThunk: one async function → three actions (pending / fulfilled / rejected) handled below.
export const fetchHistory = createAsyncThunk<
  Message[],
  string,
  { state: { history: HistoryState }; rejectValue: string }
>(
  'history/fetch',
  async (roomId, { signal, rejectWithValue }) => {
    const response = await fetch(`/api/rooms/${roomId}/messages`, { signal })
    const body = await response.json()
    if (!response.ok) return rejectWithValue(body.message)
    return body
  },
  // Don't even start if it's already loaded.
  { condition: (roomId, { getState }) => getState().history.byRoom[roomId]?.status !== 'success' },
)

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    roomOpened: (state, action: PayloadAction<string>) => {
      state.activeRoomId = action.payload
    },
    messageReceived: (state, action: PayloadAction<Message>) => {
      const room = state.byRoom[action.payload.roomId]
      if (room && !room.messages.some((message) => message.id === action.payload.id)) room.messages.push(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.pending, (state, action) => {
        const room = (state.byRoom[action.meta.arg] ??= { status: 'idle', messages: [], error: null, requestId: null })
        room.status = 'loading'
        room.error = null
        room.requestId = action.meta.requestId
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        const room = state.byRoom[action.meta.arg]
        if (room.requestId !== action.meta.requestId) return // an older request: ignore its answer
        room.status = 'success'
        room.messages = action.payload
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        const room = state.byRoom[action.meta.arg]
        if (room.requestId !== action.meta.requestId) return
        room.status = action.meta.aborted ? 'idle' : 'error' // aborted = we left the room: not an error
        room.error = action.payload ?? action.error.message ?? 'Could not load messages'
      })
      .addCase(left, () => initialState) // another slice's action: every slice can react to any action
  },
})

export const { roomOpened, messageReceived } = historySlice.actions
