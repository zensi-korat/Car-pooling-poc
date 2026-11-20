import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { findRide, rupees } from '../data/rides'

// One name per booked seat, so the seat count is passengers.length (derived, never stored).
type CartItem = { rideId: string; passengers: string[] }

type CartStore = {
  items: CartItem[]
  addSeat: (rideId: string) => void
  removeSeat: (rideId: string) => void
  removeRide: (rideId: string) => void
  setPassengerName: (rideId: string, index: number, name: string) => void
  clear: () => void
  checkout: () => string // returns a summary message
}

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      // immer: `state` inside set(fn) is a draft. Change it directly; immer builds the new objects.
      immer((set, get) => ({
        items: [],

        addSeat: (rideId) =>
          set(
            (state) => {
              const item = state.items.find((i) => i.rideId === rideId)
              if (!item) {
                state.items.push({ rideId, passengers: [''] })
                return
              }
              if (item.passengers.length >= (findRide(rideId)?.seatsLeft ?? 0)) return // full: draft untouched = no update
              item.passengers.push('')
            },
            false,
            'cart/addSeat',
          ),

        removeSeat: (rideId) =>
          set(
            (state) => {
              const item = state.items.find((i) => i.rideId === rideId)
              if (!item) return
              item.passengers.pop()
              if (item.passengers.length === 0) state.items = state.items.filter((i) => i.rideId !== rideId)
            },
            false,
            'cart/removeSeat',
          ),

        removeRide: (rideId) =>
          set(
            (state) => {
              state.items = state.items.filter((i) => i.rideId !== rideId)
            },
            false,
            'cart/removeRide',
          ),

        // Two levels deep (a cart line → one passenger): the case immer makes easy.
        setPassengerName: (rideId, index, name) =>
          set(
            (state) => {
              const item = state.items.find((i) => i.rideId === rideId)
              if (item) item.passengers[index] = name
            },
            false,
            'cart/setPassengerName',
          ),

        clear: () => set({ items: [] }, false, 'cart/clear'),

        // get(): read the store inside an action (here: build the summary before emptying the cart).
        checkout: () => {
          const seats = selectSeatCount(get())
          const total = selectTotal(get())
          set({ items: [] }, false, 'cart/checkout')
          return `Booked ${seats} seat(s) for ${rupees.format(total)}`
        },
      })),
      {
        name: 'practice-cart',
        // The saved shape changed in Step 2 (seats → passengers). Older saved carts are dropped, not crashed on.
        version: 1,
        migrate: () => ({ items: [] }),
      },
    ),
    { name: 'cart' },
  ),
)

// Derived values: calculated from `items`, never stored (a stored copy could go out of date).
export function selectSeatCount(state: CartStore): number {
  return state.items.reduce((sum, item) => sum + item.passengers.length, 0)
}

export function selectTotal(state: CartStore): number {
  return state.items.reduce((sum, item) => sum + item.passengers.length * (findRide(item.rideId)?.price ?? 0), 0)
}
