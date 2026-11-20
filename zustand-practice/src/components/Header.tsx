import { selectSeatCount, useCartStore } from '../stores/cartStore'

export function Header() {
  const seatCount = useCartStore(selectSeatCount) // a derived selector: a number, redraws only when it changes
  console.log('Header drew')

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <h1 className="text-lg font-semibold">Ride Cart · Zustand practice</h1>
      <span className="rounded-full bg-black px-3 py-1 text-sm text-white">🛒 {seatCount}</span>
    </header>
  )
}
