import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getHistory } from '../../api'
import type { Message, Profile } from '../../protocol'
import { useChatStore } from '../chat'
import { send } from '../chat/socket'
import type { RoomHistory } from '../chat/types'
import { useNotificationsStore } from '../notificationsStore'

// Fake only the network functions; keep the real getErrorMessage / isAborted.
vi.mock('../../api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../api')>()),
  getHistory: vi.fn(),
  getRooms: vi.fn(),
}))
// Fake the socket's send(): true = "sent", false = "offline".
vi.mock('../chat/socket', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../chat/socket')>()),
  send: vi.fn(),
}))

const ASHA: Profile = { name: 'Asha', availability: 'available', colour: 'emerald' }
const RAVI: Profile = { name: 'Ravi', availability: 'busy', colour: 'sky' }
const LOADED: RoomHistory = { status: 'success', messages: [], error: null }

function message(overrides: Partial<Message> = {}): Message {
  return {
    id: 'm1',
    roomId: 'general',
    author: RAVI,
    text: 'hi',
    sentAt: '2026-11-19T10:00:00Z',
    replyTo: null,
    ...overrides,
  }
}

const chat = () => useChatStore.getState()
const startState = useChatStore.getState()

beforeEach(() => {
  useChatStore.setState(startState, true) // true = replace everything: each test starts clean
  useNotificationsStore.setState({ toasts: [] })
  vi.resetAllMocks()
})

describe('history', () => {
  it('loads the messages of a room', async () => {
    vi.mocked(getHistory).mockResolvedValue([message()])
    await chat().loadHistory('general')
    expect(chat().history.general).toMatchObject({ status: 'success', messages: [message()] })
  })

  it("keeps the server's error message when loading fails", async () => {
    vi.mocked(getHistory).mockRejectedValue(new Error('Could not load Random'))
    await chat().loadHistory('random')
    expect(chat().history.random).toMatchObject({ status: 'error', error: 'Could not load Random' })
  })

  it("cancels the old room's request when you switch rooms fast", () => {
    vi.mocked(getHistory).mockReturnValue(new Promise(() => {})) // never answers
    chat().openRoom('general')
    const generalSignal = vi.mocked(getHistory).mock.calls[0][1]
    chat().openRoom('rides')
    expect(generalSignal.aborted).toBe(true)
    expect(chat().history.general.status).toBe('idle') // will load again when reopened
    expect(chat().history.rides.status).toBe('loading')
  })
})

describe('unread', () => {
  it('counts messages in rooms you are not looking at, and clears when opened', () => {
    useChatStore.setState({ me: ASHA, history: { rides: LOADED } })
    chat().receiveMessage(message({ roomId: 'rides' }), 'not-mine')
    expect(chat().unread.rides).toBe(1)
    chat().openRoom('rides')
    expect(chat().unread.rides).toBeUndefined()
  })

  it('does not count my own messages', () => {
    useChatStore.setState({ me: ASHA })
    chat().receiveMessage(message({ roomId: 'rides', author: ASHA }), 'x')
    expect(chat().unread.rides).toBeUndefined()
  })
})

describe('sending (optimistic)', () => {
  beforeEach(() => useChatStore.setState({ me: ASHA, drafts: { general: 'hello' }, history: { general: LOADED } }))

  it('shows the message at once, then swaps in the server copy', () => {
    vi.mocked(send).mockReturnValue(true)
    chat().sendMessage('general', null)

    const [pending] = chat().history.general.messages
    expect(pending).toMatchObject({ text: 'hello', delivery: 'sending' })
    expect(chat().drafts.general).toBeUndefined()

    chat().receiveMessage(message({ id: 'server-1', author: ASHA, text: 'hello' }), pending.id)
    expect(chat().history.general.messages).toEqual([message({ id: 'server-1', author: ASHA, text: 'hello' })])
  })

  it('marks it failed when offline, tells the user, and Retry sends it again', () => {
    vi.mocked(send).mockReturnValue(false)
    chat().sendMessage('general', null)

    const [failed] = chat().history.general.messages
    expect(failed.delivery).toBe('failed')
    expect(useNotificationsStore.getState().toasts).toHaveLength(1)

    vi.mocked(send).mockReturnValue(true)
    chat().retryMessage(failed.id)
    expect(chat().history.general.messages[0].delivery).toBe('sending')
    expect(send).toHaveBeenCalledTimes(2)
  })
})

it('leave() resets everything except the saved drafts', () => {
  useChatStore.setState({ me: ASHA, status: 'online', history: { general: LOADED }, drafts: { rides: 'later' } })
  chat().leave()
  expect(chat()).toMatchObject({ me: null, status: 'idle', history: {}, drafts: { rides: 'later' } })
})
