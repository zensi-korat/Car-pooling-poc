import { RIDES, rupees, type Ride } from '../data/rides'
import { useCartStore } from '../stores/cartStore'

export function RideList() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-semibold">Rides</h2>
      {RIDES.map((ride) => (
        <RideCard key={ride.id} ride={ride} />
      ))}
    </section>
  )
}

function RideCard({ ride }: Readonly<{ ride: Ride }>) {
  // Only THIS ride's seats: adding a seat to another ride doesn't redraw this card.
  const seatsInCart = useCartStore((state) => state.items.find((i) => i.rideId === ride.id)?.passengers.length ?? 0)
  const addSeat = useCartStore((state) => state.addSeat)
  console.log(`RideCard ${ride.id} drew`)

  const full = seatsInCart >= ride.seatsLeft

  return (
    <div className="flex items-center justify-between rounded-lg border bg-white p-4">
      <div>
        <p className="font-medium">
          {ride.from} → {ride.to}
        </p>
        <p className="text-sm text-gray-500">
          {ride.time} · {rupees.format(ride.price)}/seat · {ride.seatsLeft} left
        </p>
      </div>
      <div className="flex items-center gap-3">
        {seatsInCart > 0 && <span className="text-sm text-gray-600">{seatsInCart} in cart</span>}
        <button
          type="button"
          onClick={() => addSeat(ride.id)}
          disabled={full}
          className="rounded-md bg-black px-3 py-1.5 text-sm text-white disabled:opacity-40"
        >
          {full ? 'Full' : 'Add seat'}
        </button>
      </div>
    </div>
  )
}
