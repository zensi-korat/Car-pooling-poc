// Code that WATCHES the stores from outside React. Imported once, from main.tsx.
import { useChatStore } from './stores/chat'
import { selectTotalUnread } from './stores/chat/selectors'
import { useNotificationsStore } from './stores/notificationsStore'
import { useUiStore } from './stores/uiStore'

let audio: AudioContext | undefined

function beep() {
  audio ??= new AudioContext()
  const tone = audio.createOscillator()
  tone.frequency.value = 880
  tone.connect(audio.destination)
  tone.start()
  tone.stop(audio.currentTime + 0.12)
}

// subscribeWithSelector: run only when THIS value changes, and get the old value too.
useChatStore.subscribe(selectTotalUnread, (total, previous) => {
  document.title = total > 0 ? `(${total}) Pool Chat` : 'Pool Chat'
  if (total > previous && !useUiStore.getState().muted) beep()
})

useChatStore.subscribe(
  (state) => state.onlineUsers,
  (users, previous) => {
    // Empty on either side = we just connected or just lost the connection: not real joins/leaves.
    if (users.length === 0 || previous.length === 0) return
    const me = useChatStore.getState().me?.name
    const before = new Set(previous.map((user) => user.name))
    const now = new Set(users.map((user) => user.name))
    const { notify } = useNotificationsStore.getState()
    for (const name of now) if (!before.has(name) && name !== me) notify(`${name} joined`)
    for (const name of before) if (!now.has(name)) notify(`${name} left`)
  },
)
