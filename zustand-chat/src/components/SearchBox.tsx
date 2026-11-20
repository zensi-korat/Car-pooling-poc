import { Search } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useChatStore } from '../stores/chat'
import { useSearchStore } from '../stores/searchStore'

export function SearchBox() {
  const { query, results, status, error, setQuery, clear } = useSearchStore(
    useShallow((state) => ({
      query: state.query,
      results: state.results,
      status: state.status,
      error: state.error,
      setQuery: state.setQuery,
      clear: state.clear,
    })),
  )
  const openRoom = useChatStore((state) => state.openRoom)
  const showResults = status !== 'idle'

  return (
    <div className="relative w-full max-w-xs">
      <Search className="absolute top-2 left-2 size-4 text-gray-400" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => event.key === 'Escape' && clear()}
        placeholder="Search messages"
        aria-label="Search messages"
        className="w-full rounded-md border py-1.5 pr-2 pl-8 text-sm"
      />
      {showResults && (
        <div className="absolute top-full z-10 mt-1 flex max-h-80 w-full flex-col gap-1 overflow-y-auto rounded-md border bg-white p-2 text-sm shadow-lg">
          {status === 'loading' && <p className="text-gray-500">Searching…</p>}
          {status === 'error' && <p className="text-red-600">{error}</p>}
          {status === 'success' && results.length === 0 && <p className="text-gray-500">No messages found.</p>}
          {status === 'success' &&
            results.map((message) => (
              <button
                key={message.id}
                type="button"
                onClick={() => {
                  openRoom(message.roomId)
                  clear()
                }}
                className="flex flex-col rounded-md px-2 py-1 text-left hover:bg-gray-100"
              >
                <span className="text-xs text-gray-500">
                  #{message.roomId} · {message.author.name}
                </span>
                <span className="truncate">{message.text}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
