// Server codes → words a person reads: "EXPIRED_NO_BOOKINGS" → "Expired no bookings", "seatsBooked" → "Seats booked".
export function humanize(code: string): string {
  const words = code
    .replaceAll('_', ' ')
    .replaceAll(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

// "Dara Driver" → "DD", "Madonna" → "M": first and last word, for avatars.
export function initials(name: string): string {
  const [first = '', ...rest] = name.trim().split(/\s+/)
  const last = rest.at(-1) ?? ''
  return (first.charAt(0) + last.charAt(0)).toUpperCase()
}
