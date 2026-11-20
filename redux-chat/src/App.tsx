import { useState } from 'react'
import { Chat } from './components/Chat'
import { joined } from './store/connectionSlice'
import { useAppDispatch, useAppSelector } from './store'

export default function App() {
  const me = useAppSelector((state) => state.connection.me)
  return me ? <Chat /> : <JoinScreen />
}

function JoinScreen() {
  const dispatch = useAppDispatch()
  const [name, setName] = useState('')

  return (
    <main className="flex min-h-svh items-center justify-center bg-gray-50 p-6">
      <form
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-white p-6"
        onSubmit={(event) => {
          event.preventDefault()
          if (name.trim()) dispatch(joined(name.trim()))
        }}
      >
        <h1 className="text-xl font-semibold">Pool Chat (Redux)</h1>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Your name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-md border px-3 py-2 font-normal"
            autoFocus
          />
        </label>
        <button
          type="submit"
          disabled={!name.trim()}
          className="rounded-md bg-black px-3 py-2 text-white disabled:opacity-40"
        >
          Join
        </button>
      </form>
    </main>
  )
}
