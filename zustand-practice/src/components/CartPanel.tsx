import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { findRide, rupees } from '../data/rides'
import { selectSeatCount, selectTotal, useCartStore } from '../stores/cartStore'

export function CartPanel() {
  const items = useCartStore((state) => state.items)
  // Two values in one selector → a new object every time → useShallow compares what's inside.
  const { seats, total } = useCartStore(
    useShallow((state) => ({ seats: selectSeatCount(state), total: selectTotal(state) })),
  )
  const { addSeat, removeSeat, removeRide, setPassengerName, clear, checkout } = useCartStore(
    useShallow((state) => ({
      addSeat: state.addSeat,
      removeSeat: state.removeSeat,
      removeRide: state.removeRide,
      setPassengerName: state.setPassengerName,
      clear: state.clear,
      checkout: state.checkout,
    })),
  )
  const [message, setMessage] = useState<string | null>(null)
  console.log('CartPanel drew')

  return (
    <aside className="flex flex-col gap-3 rounded-lg border bg-white p-4">
      <h2 className="font-semibold">Your cart</h2>

      {items.length === 0 && <p className="text-sm text-gray-500">Empty. Add a seat from the list.</p>}

      {items.map((item) => {
        const ride = findRide(item.rideId)
        return (
          <div key={item.rideId} className="flex flex-col gap-2 rounded-md border p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium">
                {ride?.from} → {ride?.to}
              </span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => removeSeat(item.rideId)} className="rounded border px-2">
                  −
                </button>
                <span>{item.passengers.length}</span>
                <button type="button" onClick={() => addSeat(item.rideId)} className="rounded border px-2">
                  +
                </button>
                <button type="button" onClick={() => removeRide(item.rideId)} className="text-red-600">
                  Remove
                </button>
              </div>
            </div>
            {item.passengers.map((name, index) => (
              <input
                key={index}
                value={name}
                onChange={(event) => setPassengerName(item.rideId, index, event.target.value)}
                placeholder={`Passenger ${index + 1} name`}
                aria-label={`Passenger ${index + 1} name`}
                className="rounded border px-2 py-1"
              />
            ))}
          </div>
        )
      })}

      <div className="flex justify-between border-t pt-3 font-medium">
        <span>{seats} seat(s)</span>
        <span>{rupees.format(total)}</span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMessage(checkout())}
          disabled={items.length === 0}
          className="flex-1 rounded-md bg-black px-3 py-2 text-sm text-white disabled:opacity-40"
        >
          Checkout
        </button>
        <button type="button" onClick={clear} className="rounded-md border px-3 py-2 text-sm">
          Clear
        </button>
      </div>

      {message && <p className="text-sm text-green-700">{message}</p>}
    </aside>
  )
}
