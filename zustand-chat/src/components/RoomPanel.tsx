import { Reply, RotateCcw, X } from 'lucide-react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { createStore, useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { useChatStore } from '../stores/chat'
import { selectHistory } from '../stores/chat/selectors'
import type { ChatMessage } from '../stores/chat/types'
import { Avatar } from './Avatar'

const time = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' })

export function RoomPanels() {
  const { activeRoomId, sideRoomId } = useChatStore(
    useShallow((state) => ({ activeRoomId: state.activeRoomId, sideRoomId: state.sideRoomId })),
  )

  return (
    <div className={`grid min-h-0 gap-4 ${sideRoomId ? 'lg:grid-cols-2' : ''}`}>
      {/* key: a new room = a new panel, with a fresh panel store */}
      <RoomPanel key={activeRoomId} roomId={activeRoomId} />
      {sideRoomId && <RoomPanel key={sideRoomId} roomId={sideRoomId} beside />}
    </div>
  )
}

// ---------- a store per panel (createStore + Context) ----------

type PanelStore = {
  replyTo: ChatMessage | null
  setReplyTo: (message: ChatMessage | null) => void
}

const createPanelStore = () =>
  createStore<PanelStore>()((set) => ({
    replyTo: null,
    setReplyTo: (replyTo) => set({ replyTo }),
  }))

const PanelStoreContext = createContext<ReturnType<typeof createPanelStore> | null>(null)

function usePanelStore<T>(selector: (state: PanelStore) => T): T {
  const store = useContext(PanelStoreContext)
  if (!store) throw new Error('usePanelStore() used outside a RoomPanel')
  return useStore(store, selector)
}

function RoomPanel({ roomId, beside = false }: Readonly<{ roomId: string; beside?: boolean }>) {
  const [panelStore] = useState(createPanelStore) // made once per panel, kept for its whole life
  const roomName = useChatStore((state) => state.rooms.find((room) => room.id === roomId)?.name ?? roomId)
  const closeBeside = useChatStore((state) => state.closeBeside)

  return (
    <PanelStoreContext value={panelStore}>
      <section className="flex min-h-[60svh] flex-col rounded-xl border bg-white lg:min-h-0">
        <header className="flex items-center justify-between border-b px-4 py-2">
          <h2 className="font-semibold"># {roomName}</h2>
          {beside && (
            <button type="button" onClick={closeBeside} aria-label="Close" className="rounded-md p-1 hover:bg-gray-100">
              <X className="size-4" />
            </button>
          )}
        </header>
        <MessageList roomId={roomId} />
        <TypingIndicator roomId={roomId} />
        <Composer roomId={roomId} />
      </section>
    </PanelStoreContext>
  )
}

// ---------- messages ----------

function MessageList({ roomId }: Readonly<{ roomId: string }>) {
  const { status, messages, error } = useChatStore(selectHistory(roomId))
  const loadHistory = useChatStore((state) => state.loadHistory)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
      {status === 'loading' && messages.length === 0 && <p className="text-sm text-gray-500">Loading messages…</p>}
      {status === 'error' && (
        <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}{' '}
          <button type="button" onClick={() => void loadHistory(roomId)} className="font-medium underline">
            Retry
          </button>
        </div>
      )}
      {status === 'success' && messages.length === 0 && <p className="text-sm text-gray-500">No messages yet.</p>}
      {messages.map((message) => (
        <MessageRow key={message.id} message={message} />
      ))}
      <div ref={endRef} />
    </div>
  )
}

function MessageRow({ message }: Readonly<{ message: ChatMessage }>) {
  const setReplyTo = usePanelStore((state) => state.setReplyTo)
  const retryMessage = useChatStore((state) => state.retryMessage)

  return (
    <article className={`group flex gap-2 ${message.delivery === 'sending' ? 'opacity-60' : ''}`}>
      <Avatar profile={message.author} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-baseline gap-2 text-sm">
          <span className="font-medium">{message.author.name}</span>
          <span className="text-xs text-gray-400">{time.format(new Date(message.sentAt))}</span>
          {message.delivery === 'sending' && <span className="text-xs text-gray-400">sending…</span>}
          {!message.delivery && (
            <button
              type="button"
              onClick={() => setReplyTo(message)}
              aria-label="Reply"
              className="ml-auto text-gray-400 opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <Reply className="size-4" />
            </button>
          )}
        </div>
        {message.replyTo && (
          <p className="truncate border-l-2 pl-2 text-xs text-gray-500">
            {message.replyTo.author}: {message.replyTo.text}
          </p>
        )}
        <p className="text-sm break-words whitespace-pre-wrap">{message.text}</p>
        {message.delivery === 'failed' && (
          <p className="flex items-center gap-2 text-xs text-red-600">
            Not sent: {message.failReason}
            <button
              type="button"
              onClick={() => retryMessage(message.id)}
              className="inline-flex items-center gap-1 font-medium underline"
            >
              <RotateCcw className="size-3" /> Retry
            </button>
          </p>
        )}
      </div>
    </article>
  )
}

// Transient update: the text changes often, so it's written straight into the element.
// The component subscribes without a hook and never redraws.
function TypingIndicator({ roomId }: Readonly<{ roomId: string }>) {
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    function show(names: string[] = []) {
      if (!ref.current) return
      ref.current.textContent = names.length ? `${names.join(', ')} ${names.length === 1 ? 'is' : 'are'} typing…` : ''
    }
    show(useChatStore.getState().typing[roomId])
    return useChatStore.subscribe((state) => state.typing[roomId], show) // returns the "unsubscribe" for cleanup
  }, [roomId])

  return <p ref={ref} aria-live="polite" className="h-5 px-4 text-xs text-gray-500" />
}

// ---------- composer ----------

function Composer({ roomId }: Readonly<{ roomId: string }>) {
  const draft = useChatStore((state) => state.drafts[roomId] ?? '')
  const { setDraft, sendMessage, notifyTyping } = useChatStore(
    useShallow((state) => ({
      setDraft: state.setDraft,
      sendMessage: state.sendMessage,
      notifyTyping: state.notifyTyping,
    })),
  )
  const { replyTo, setReplyTo } = usePanelStore(
    useShallow((state) => ({ replyTo: state.replyTo, setReplyTo: state.setReplyTo })),
  )

  return (
    <form
      className="flex flex-col gap-2 border-t p-3"
      onSubmit={(event) => {
        event.preventDefault()
        sendMessage(roomId, replyTo && { author: replyTo.author.name, text: replyTo.text })
        setReplyTo(null)
      }}
    >
      {replyTo && (
        <div className="flex items-center justify-between rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
          <span className="truncate">
            Replying to {replyTo.author.name}: {replyTo.text}
          </span>
          <button type="button" onClick={() => setReplyTo(null)} aria-label="Cancel reply">
            <X className="size-3" />
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => {
            setDraft(roomId, event.target.value)
            notifyTyping(roomId)
          }}
          maxLength={500}
          placeholder="Write a message (try one containing !fail)"
          aria-label="Message"
          className="min-w-0 flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </form>
  )
}
