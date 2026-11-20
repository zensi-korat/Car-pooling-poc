import { Bell, BellOff, Menu } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { AVAILABILITIES, COLOURS, type Availability } from '../protocol'
import { useChatStore, useMe } from '../stores/chat'
import { useUiStore } from '../stores/uiStore'
import { Avatar } from './Avatar'
import { AVAILABILITY, AVATAR } from './profileStyles'
import { RoomPanels } from './RoomPanel'
import { SearchBox } from './SearchBox'
import { Sidebar } from './Sidebar'

const DOT = { idle: 'bg-gray-400', connecting: 'bg-amber-500', online: 'bg-green-500', offline: 'bg-red-500' }

export function ChatScreen() {
  return (
    <div className="flex h-svh flex-col bg-gray-50">
      <Header />
      <ConnectionBanner />
      <div className="mx-auto grid min-h-0 w-full max-w-6xl flex-1 gap-4 p-4 md:grid-cols-[260px_1fr]">
        <Sidebar />
        <RoomPanels />
      </div>
    </div>
  )
}

function Header() {
  const { status, leave } = useChatStore(useShallow((state) => ({ status: state.status, leave: state.leave })))
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <button type="button" onClick={toggleSidebar} aria-label="Rooms" className="rounded-md p-1 md:hidden">
          <Menu className="size-5" />
        </button>
        <span className={`size-2.5 rounded-full ${DOT[status]}`} aria-label={status} />
        <h1 className="font-semibold">Pool Chat</h1>
      </div>
      <SearchBox />
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <ProfileControls />
        <MuteButton />
        <button type="button" onClick={leave} className="rounded-md border px-3 py-1">
          Leave
        </button>
      </div>
    </header>
  )
}

function ProfileControls() {
  const me = useMe()
  const updateProfile = useChatStore((state) => state.updateProfile)

  return (
    <>
      <Avatar profile={me} />
      <span className="font-medium">{me.name}</span>
      <select
        aria-label="Availability"
        value={me.availability}
        onChange={(event) => updateProfile({ availability: event.target.value as Availability })}
        className="rounded-md border px-2 py-1"
      >
        {AVAILABILITIES.map((availability) => (
          <option key={availability} value={availability}>
            {AVAILABILITY[availability].label}
          </option>
        ))}
      </select>
      <div className="flex gap-1">
        {COLOURS.map((colour) => (
          <button
            key={colour}
            type="button"
            aria-label={colour}
            aria-pressed={me.colour === colour}
            onClick={() => updateProfile({ colour })}
            className={`size-5 rounded-full ${AVATAR[colour]} ${me.colour === colour ? 'ring-2 ring-gray-900 ring-offset-1' : ''}`}
          />
        ))}
      </div>
    </>
  )
}

function MuteButton() {
  const { muted, setMuted } = useUiStore(useShallow((state) => ({ muted: state.muted, setMuted: state.setMuted })))
  const Icon = muted ? BellOff : Bell

  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      aria-label={muted ? 'Unmute' : 'Mute'}
      className="rounded-md border p-1.5"
    >
      <Icon className="size-4" />
    </button>
  )
}

function ConnectionBanner() {
  const { status, error } = useChatStore(useShallow((state) => ({ status: state.status, error: state.error })))
  if (status === 'online') return null

  return (
    <div role="status" className="bg-amber-100 px-4 py-2 text-sm text-amber-900">
      {status === 'connecting' ? 'Connecting…' : `Offline. ${error ?? 'Connection lost.'} Retrying…`}
    </div>
  )
}
