import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type Toast = { id: number; text: string; tone: 'info' | 'error' }

type NotificationsStore = {
  toasts: Toast[]
  notify: (text: string, tone?: Toast['tone']) => void
  dismiss: (id: number) => void
}

const SHOWN_MS = 4000
const MAX_SHOWN = 3

let nextId = 1

// Anyone can call notify(): components through the hook, other stores and plain code through getState().
export const useNotificationsStore = create<NotificationsStore>()(
  devtools(
    (set, get) => ({
      toasts: [],

      notify: (text, tone = 'info') => {
        const id = nextId++
        set(
          (state) => ({ toasts: [...state.toasts, { id, text, tone }].slice(-MAX_SHOWN) }),
          false,
          'notifications/notify',
        )
        setTimeout(() => get().dismiss(id), SHOWN_MS)
      },

      dismiss: (id) =>
        set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }), false, 'notifications/dismiss'),
    }),
    { name: 'notifications' },
  ),
)
