import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { chatApi } from './chatApi'
import { connectionSlice } from './connectionSlice'
import { historySlice } from './historySlice'
import { socketMiddleware } from './socketMiddleware'

// ONE store for the whole app; each slice owns one key. Redux DevTools are on by default.
export const store = configureStore({
  reducer: {
    connection: connectionSlice.reducer,
    history: historySlice.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(chatApi.middleware, socketMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed versions of the react-redux hooks: use these everywhere instead of the plain ones.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
