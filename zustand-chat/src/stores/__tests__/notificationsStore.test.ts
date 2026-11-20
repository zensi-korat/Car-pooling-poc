import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useNotificationsStore } from '../notificationsStore'

const notifications = () => useNotificationsStore.getState()

beforeEach(() => {
  vi.useFakeTimers()
  useNotificationsStore.setState({ toasts: [] })
})

afterEach(() => vi.useRealTimers())

it('shows a toast and hides it after 4 seconds', () => {
  notifications().notify('Ravi joined')
  expect(notifications().toasts).toMatchObject([{ text: 'Ravi joined', tone: 'info' }])
  vi.advanceTimersByTime(4000)
  expect(notifications().toasts).toEqual([])
})

it('shows at most 3 at a time (the newest)', () => {
  for (const name of ['A', 'B', 'C', 'D']) notifications().notify(`${name} joined`)
  expect(notifications().toasts.map((toast) => toast.text)).toEqual(['B joined', 'C joined', 'D joined'])
})
