import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { getErrorMessage, isAborted, searchMessages } from '../api'
import type { Message } from '../protocol'
import type { LoadStatus } from './chat/types'

type SearchStore = {
  query: string
  results: Message[]
  status: LoadStatus
  error: string | null
  setQuery: (query: string) => void
  clear: () => void
}

const DEBOUNCE_MS = 300
const MIN_LENGTH = 2

// Tools, not data: the waiting timer and the request in flight.
let debounceTimer: ReturnType<typeof setTimeout> | undefined
let request: AbortController | undefined

export const useSearchStore = create<SearchStore>()(
  devtools(
    (set) => {
      async function run(query: string) {
        request = new AbortController()
        const { signal } = request
        set({ status: 'loading', error: null }, false, 'search/start')
        try {
          const results = await searchMessages(query, signal)
          set({ results, status: 'success' }, false, 'search/done')
        } catch (error) {
          if (isAborted(error)) return // a newer search replaced this one
          set({ status: 'error', error: getErrorMessage(error) }, false, 'search/failed')
        }
      }

      // Called on every key press. Waits until typing pauses, and cancels the previous search, so an old,
      // slow answer can never overwrite a newer one.
      function stopPending() {
        clearTimeout(debounceTimer)
        request?.abort()
      }

      return {
        query: '',
        results: [],
        status: 'idle',
        error: null,

        setQuery: (query) => {
          set({ query }, false, 'search/type')
          stopPending()
          if (query.trim().length < MIN_LENGTH) {
            set({ results: [], status: 'idle', error: null }, false, 'search/tooShort')
            return
          }
          debounceTimer = setTimeout(() => void run(query.trim()), DEBOUNCE_MS)
        },

        clear: () => {
          stopPending()
          set({ query: '', results: [], status: 'idle', error: null }, false, 'search/clear')
        },
      }
    },
    { name: 'search' },
  ),
)
