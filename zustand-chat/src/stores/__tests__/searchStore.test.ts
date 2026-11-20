import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { searchMessages } from '../../api'
import type { Message } from '../../protocol'
import { useSearchStore } from '../searchStore'

vi.mock('../../api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../api')>()),
  searchMessages: vi.fn(),
}))

const found = (text: string): Message => ({
  id: text,
  roomId: 'rides',
  author: { name: 'Ravi', availability: 'busy', colour: 'sky' },
  text,
  sentAt: '2026-11-19T10:00:00Z',
  replyTo: null,
})

// Like axios: a request that is never answered, but rejects when its signal is aborted.
function hangUntilAborted(_query: string, signal: AbortSignal) {
  return new Promise<Message[]>((_resolve, reject) =>
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))),
  )
}

const search = () => useSearchStore.getState()
const startState = useSearchStore.getState()

beforeEach(() => {
  vi.useFakeTimers() // we move the clock ourselves
  useSearchStore.setState(startState, true)
  vi.resetAllMocks()
})

afterEach(() => vi.useRealTimers())

it('waits until typing pauses, then searches once', async () => {
  vi.mocked(searchMessages).mockResolvedValue([found('ride at 9')])
  search().setQuery('ri')
  search().setQuery('rid')
  search().setQuery('ride')
  expect(searchMessages).not.toHaveBeenCalled()

  await vi.advanceTimersByTimeAsync(300)
  expect(searchMessages).toHaveBeenCalledTimes(1)
  expect(vi.mocked(searchMessages).mock.calls[0][0]).toBe('ride')
  expect(search()).toMatchObject({ status: 'success', results: [found('ride at 9')] })
})

it('does not search for less than 2 characters', async () => {
  search().setQuery('r')
  await vi.advanceTimersByTimeAsync(300)
  expect(searchMessages).not.toHaveBeenCalled()
  expect(search().status).toBe('idle')
})

it('cancels the older search, so its late answer can never win', async () => {
  vi.mocked(searchMessages)
    .mockImplementationOnce(hangUntilAborted)
    .mockResolvedValueOnce([found('ride at 9')])
  search().setQuery('ri')
  await vi.advanceTimersByTimeAsync(300)
  const olderSignal = vi.mocked(searchMessages).mock.calls[0][1]

  search().setQuery('ride')
  expect(olderSignal.aborted).toBe(true)
  await vi.advanceTimersByTimeAsync(300)
  expect(search()).toMatchObject({ status: 'success', results: [found('ride at 9')] })
})

it("shows the server's error", async () => {
  vi.mocked(searchMessages).mockRejectedValue(new Error('Search is down'))
  search().setQuery('ride')
  await vi.advanceTimersByTimeAsync(300)
  expect(search()).toMatchObject({ status: 'error', error: 'Search is down' })
})
