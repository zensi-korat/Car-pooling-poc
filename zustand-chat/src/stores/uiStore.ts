import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type UiStore = {
  sidebarOpen: boolean // phones only: the header button opens it, picking a room closes it
  muted: boolean // no sound for new unread messages
  toggleSidebar: () => void
  closeSidebar: () => void
  setMuted: (muted: boolean) => void
}

// Every tab of this site on this browser can talk on this channel.
const channel = new BroadcastChannel('pool-chat-ui')

export const useUiStore = create<UiStore>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: false,
        muted: false,
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'ui/toggleSidebar'),
        closeSidebar: () => set({ sidebarOpen: false }, false, 'ui/closeSidebar'),
        setMuted: (muted) => {
          set({ muted }, false, 'ui/setMuted')
          channel.postMessage({ muted }) // tell the other tabs
        },
      }),
      { name: 'pool-chat-ui', partialize: (state) => ({ muted: state.muted }) },
    ),
    { name: 'ui' },
  ),
)

// Another tab changed it: copy it in. setState (not setMuted), so we don't post it back and loop forever.
channel.addEventListener('message', (event: MessageEvent<{ muted: boolean }>) => {
  useUiStore.setState({ muted: event.data.muted }, false, 'ui/fromOtherTab')
})
