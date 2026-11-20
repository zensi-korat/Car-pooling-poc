import { Columns2 } from 'lucide-react'
import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { Room } from '../protocol'
import { useChatStore, useMe } from '../stores/chat'
import { selectStats } from '../stores/chat/selectors'
import { useUiStore } from '../stores/uiStore'
import { Avatar } from './Avatar'
import { AVAILABILITY } from './profileStyles'

export function Sidebar() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen)

  return (
    <aside className={`min-h-0 flex-col gap-4 overflow-y-auto ${sidebarOpen ? 'flex' : 'hidden md:flex'}`}>
      <RoomList />
      <OnlineUsers />
      <StatsPanel />
    </aside>
  )
}

const card = 'flex flex-col gap-2 rounded-xl border bg-white p-4'

function RoomList() {
  const { rooms, roomsStatus, roomsError, loadRooms } = useChatStore(
    useShallow((state) => ({
      rooms: state.rooms,
      roomsStatus: state.roomsStatus,
      roomsError: state.roomsError,
      loadRooms: state.loadRooms,
    })),
  )
  const [filter, setFilter] = useState('') // only this list uses it: useState, not a store
  const shown = rooms.filter((room) => room.name.toLowerCase().includes(filter.trim().toLowerCase()))

  return (
    <section className={card}>
      <h2 className="text-sm font-semibold">Rooms</h2>
      <input
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        placeholder="Filter rooms"
        aria-label="Filter rooms"
        className="rounded-md border px-2 py-1 text-sm"
      />
      {roomsStatus === 'loading' && <p className="text-sm text-gray-500">Loading rooms…</p>}
      {roomsStatus === 'error' && (
        <p className="text-sm text-red-600">
          {roomsError}{' '}
          <button type="button" onClick={() => void loadRooms()} className="underline">
            Retry
          </button>
        </p>
      )}
      <ul className="flex flex-col gap-1">
        {shown.map((room) => (
          <RoomItem key={room.id} room={room} />
        ))}
      </ul>
      {roomsStatus === 'success' && shown.length === 0 && <p className="text-sm text-gray-500">No rooms match.</p>}
    </section>
  )
}

// Each row reads only ITS OWN unread count, so a new message in Rides redraws only the Rides row.
function RoomItem({ room }: Readonly<{ room: Room }>) {
  const unread = useChatStore((state) => state.unread[room.id] ?? 0)
  const active = useChatStore((state) => state.activeRoomId === room.id)
  const beside = useChatStore((state) => state.sideRoomId === room.id)
  const { openRoom, openBeside } = useChatStore(
    useShallow((state) => ({ openRoom: state.openRoom, openBeside: state.openBeside })),
  )
  const closeSidebar = useUiStore((state) => state.closeSidebar)

  return (
    <li className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => {
          openRoom(room.id)
          closeSidebar()
        }}
        className={`flex flex-1 items-center justify-between rounded-md px-2 py-1.5 text-left text-sm ${active || beside ? 'bg-gray-100 font-medium' : ''}`}
      >
        <span className="truncate"># {room.name}</span>
        {unread > 0 && <span className="rounded-full bg-black px-1.5 text-xs text-white">{unread}</span>}
      </button>
      {!active && (
        <button
          type="button"
          onClick={() => openBeside(room.id)}
          aria-label={`Open ${room.name} beside`}
          title="Open beside"
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
        >
          <Columns2 className="size-4" />
        </button>
      )}
    </li>
  )
}

function OnlineUsers() {
  const onlineUsers = useChatStore((state) => state.onlineUsers)
  const me = useMe()

  return (
    <section className={card}>
      <h2 className="text-sm font-semibold">Online ({onlineUsers.length})</h2>
      <ul className="flex flex-col gap-2 text-sm">
        {onlineUsers.map((user) => (
          <li key={user.name} className="flex items-center gap-2">
            <Avatar profile={user} />
            <div className="flex flex-col">
              <span>
                {user.name} {user.name === me.name && <span className="text-gray-400">(you)</span>}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <span className={`size-1.5 rounded-full ${AVAILABILITY[user.availability].dot}`} />
                {AVAILABILITY[user.availability].label}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

type StatKey = keyof ReturnType<typeof selectStats>

const STAT_LABELS: Record<StatKey, string> = {
  online: 'Online',
  rooms: 'Rooms',
  loadedMessages: 'Messages loaded',
  sentByMe: 'Sent by me',
  unread: 'Unread',
  drafts: 'Drafts',
}

// A small dashboard: every number is derived from the store by one selector.
function StatsPanel() {
  const stats = useChatStore(useShallow(selectStats))

  return (
    <section className={card}>
      <h2 className="text-sm font-semibold">Stats</h2>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        {(Object.keys(STAT_LABELS) as StatKey[]).map((key) => (
          <div key={key} className="rounded-md bg-gray-50 p-2">
            <dt className="text-xs text-gray-500">{STAT_LABELS[key]}</dt>
            <dd className="font-semibold">{stats[key]}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
