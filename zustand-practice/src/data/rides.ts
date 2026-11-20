// Fixed sample data. In a real app this list comes from the server (TanStack Query), never from a store.
export type Ride = {
  id: string
  from: string
  to: string
  time: string
  price: number // per seat, in ₹
  seatsLeft: number
}

export const RIDES: Ride[] = [
  { id: 'r1', from: 'Ahmedabad', to: 'Vadodara', time: 'Mon 08:00', price: 250, seatsLeft: 3 },
  { id: 'r2', from: 'Ahmedabad', to: 'Surat', time: 'Mon 09:30', price: 450, seatsLeft: 2 },
  { id: 'r3', from: 'Vadodara', to: 'Mumbai', time: 'Tue 06:00', price: 900, seatsLeft: 4 },
  { id: 'r4', from: 'Surat', to: 'Pune', time: 'Wed 07:15', price: 1100, seatsLeft: 1 },
]

export function findRide(id: string): Ride | undefined {
  return RIDES.find((ride) => ride.id === id)
}

export const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
