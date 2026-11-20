import { useShallow } from 'zustand/react/shallow'
import { useNotificationsStore } from '../stores/notificationsStore'

const TONE = { info: 'bg-gray-900 text-white', error: 'bg-red-600 text-white' }

export function Toasts() {
  const { toasts, dismiss } = useNotificationsStore(
    useShallow((state) => ({ toasts: state.toasts, dismiss: state.dismiss })),
  )

  return (
    <ol aria-live="polite" className="fixed top-16 right-4 z-20 flex w-72 flex-col gap-2">
      {toasts.map((toast) => (
        <li key={toast.id}>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            className={`w-full rounded-lg px-4 py-3 text-left text-sm shadow-lg ${TONE[toast.tone]}`}
          >
            {toast.text}
          </button>
        </li>
      ))}
    </ol>
  )
}
