import { useState } from 'react'
import { useChatStore } from '../stores/chat'

export function JoinScreen() {
  const join = useChatStore((state) => state.join)
  const [name, setName] = useState('') // what's being typed: only this form needs it

  return (
    <main className="flex min-h-svh items-center justify-center bg-gray-50 p-6">
      <form
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-white p-6"
        onSubmit={(event) => {
          event.preventDefault()
          if (name.trim()) void join(name.trim())
        }}
      >
        <h1 className="text-xl font-semibold">Pool Chat</h1>
        <p className="text-sm text-gray-500">Open a second tab with another name to chat with yourself.</p>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Your name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Asha"
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
