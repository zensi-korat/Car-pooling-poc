// Server codes → words a person reads: "EXPIRED_NO_BOOKINGS" → "Expired no bookings", "seatsBooked" → "Seats booked".
export function humanize(code: string): string {
  const words = code
    .replaceAll('_', ' ')
    .replaceAll(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
  return words.charAt(0).toUpperCase() + words.slice(1)
}
