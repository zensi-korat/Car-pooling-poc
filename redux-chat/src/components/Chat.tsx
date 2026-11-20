import { useEffect, useState } from 'react'
import { chatApi, errorMessage, useGetRoomsQuery, useSearchMessagesQuery } from '../store/chatApi'
import { left } from '../store/connectionSlice'
import { fetchHistory, roomOpened, sendMessage } from '../store/historySlice'
import { useAppDispatch, useAppSelector } from '../store'

const card = 'flex flex-col gap-2 rounded-xl border bg-white p-4'

export function Chat() {
  return (
    <div className="flex h-svh flex-col bg-gray-50">
      <Header />
      <div className="mx-auto grid min-h-0 w-full max-w-5xl flex-1 gap-4 p-4 md:grid-cols-[240px_1fr]">
        <aside className="flex flex-col gap-4">
          <Rooms />
          <Online />
        </aside>
        <RoomView />
      </div>
    </div>
  )
}

function Header() {
  const me = useAppSelector((state) => state.connection.me)
  const status = useAppSelector((state) => state.connection.status)
  const dispatch = useAppDispatch()

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-white px-4 py-3">
      <h1 className="font-semibold">Pool Chat (Redux) · {status}</h1>
      <Search />
      <div className="flex items-center gap-3 text-sm">
        <span>{me?.name}</span>
        <button
          type="button"
          onClick={() => {
            dispatch(left())
            dispatch(chatApi.util.resetApiState()) // forget cached rooms/search too
          }}
          className="rounded-md border px-3 py-1"
        >
          Leave
        </button>
      </div>
    </header>
  )
}

function Rooms() {
  const { data: rooms = [], isLoading, error, refetch } = useGetRoomsQuery()
  const activeRoomId = useAppSelector((state) => state.history.activeRoomId)
  const dispatch = useAppDispatch()

  return (
    <section className={card}>
      <h2 className="text-sm font-semibold">Rooms</h2>
      {isLoading && <p className="text-sm text-gray-500">Loading rooms…</p>}
      {error && (
        <p className="text-sm text-red-600">
          {errorMessage(error)}{' '}
          <button type="button" onClick={() => void refetch()} className="underline">
            Retry
          </button>
        </p>
      )}
      {rooms.map((room) => (
        <button
          key={room.id}
          type="button"
          onClick={() => dispatch(roomOpened(room.id))}
          className={`rounded-md px-2 py-1.5 text-left text-sm ${room.id === activeRoomId ? 'bg-gray-100 font-medium' : ''}`}
        >
          # {room.name}
        </button>
      ))}
    </section>
  )
}

function Online() {
  const onlineUsers = useAppSelector((state) => state.connection.onlineUsers)

  return (
    <section className={card}>
      <h2 className="text-sm font-semibold">Online ({onlineUsers.length})</h2>
      {onlineUsers.map((user) => (
        <span key={user.name} className="text-sm">
          {user.name}
        </span>
      ))}
    </section>
  )
}

function RoomView() {
  const roomId = useAppSelector((state) => state.history.activeRoomId)
  const room = useAppSelector((state) => state.history.byRoom[roomId])
  const dispatch = useAppDispatch()
  const [text, setText] = useState('')

  // A dispatched thunk can be cancelled: leaving the room aborts its request (signal → fetch).
  useEffect(() => {
    const request = dispatch(fetchHistory(roomId))
    return () => request.abort()
  }, [dispatch, roomId])

  return (
    <section className="flex min-h-0 flex-col rounded-xl border bg-white">
      <h2 className="border-b px-4 py-2 font-semibold"># {roomId}</h2>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4 text-sm">
        {room?.status === 'loading' && <p className="text-gray-500">Loading messages…</p>}
        {room?.status === 'error' && (
          <p role="alert" className="text-red-600">
            {room.error}{' '}
            <button type="button" onClick={() => void dispatch(fetchHistory(roomId))} className="underline">
              Retry
            </button>
          </p>
        )}
        {room?.messages.map((message) => (
          <p key={message.id}>
            <span className="font-medium">{message.author.name}:</span> {message.text}
          </p>
        ))}
      </div>
      <form
        className="flex gap-2 border-t p-3"
        onSubmit={(event) => {
          event.preventDefault()
          if (!text.trim()) return
          dispatch(sendMessage({ roomId, text: text.trim() }))
          setText('')
        }}
      >
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="Message"
          placeholder="Write a message"
          className="min-w-0 flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-black px-4 py-2 text-sm text-white">
          Send
        </button>
      </form>
    </section>
  )
}

function Search() {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  // RTK Query keeps one cache entry per query text, and `currentData` is only ever the answer for
  // the CURRENT text: a slow old answer can't show up for a newer query.
  const { currentData, isFetching, error } = useSearchMessagesQuery(debounced, { skip: debounced.length < 2 })

  return (
    <div className="relative w-full max-w-xs">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Search messages"
        placeholder="Search messages"
        className="w-full rounded-md border px-2 py-1.5 text-sm"
      />
      {debounced.length >= 2 && (
        <div className="absolute top-full z-10 mt-1 flex w-full flex-col gap-1 rounded-md border bg-white p-2 text-sm shadow-lg">
          {isFetching && <p className="text-gray-500">Searching…</p>}
          {error && <p className="text-red-600">{errorMessage(error)}</p>}
          {currentData?.length === 0 && <p className="text-gray-500">No messages found.</p>}
          {currentData?.map((message) => (
            <p key={message.id} className="truncate">
              #{message.roomId} · {message.author.name}: {message.text}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
