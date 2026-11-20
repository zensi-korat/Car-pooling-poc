import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Profile } from '../../protocol'
import { logger } from '../middleware/logger'
import { createConnectionSlice } from './connectionSlice'
import { createMessagesSlice } from './messagesSlice'
import { createRoomsSlice } from './roomsSlice'
import type { ChatStore } from './types'

// One store, built from three slices. The middleware wraps it from the outside in:
// devtools (see every change) → logger (print it) → subscribeWithSelector (watch one value)
// → persist (save drafts) → immer (write changes as if mutating).
export const useChatStore = create<ChatStore>()(
  devtools(
    logger(
      subscribeWithSelector(
        persist(
          immer((...tools) => ({
            ...createConnectionSlice(...tools),
            ...createRoomsSlice(...tools),
            ...createMessagesSlice(...tools),
          })),
          {
            name: 'pool-chat',
            version: 1,
            // Save ONLY the drafts: never the socket state, the profile list or loaded messages.
            partialize: (state) => ({ drafts: state.drafts }),
          },
        ),
      ),
      'chat',
    ),
    { name: 'chat' },
  ),
)

// For components that only show inside the chat (App shows them only when `me` is set). Like Pool's useCurrentUser.
export function useMe(): Profile {
  const me = useChatStore((state) => state.me)
  if (!me) throw new Error('useMe() used outside the chat screen')
  return me
}
