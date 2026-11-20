import type { Availability, Colour } from '../protocol'

export const AVATAR: Record<Colour, string> = {
  rose: 'bg-rose-500',
  sky: 'bg-sky-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  violet: 'bg-violet-500',
}

export const AVAILABILITY: Record<Availability, { label: string; dot: string }> = {
  available: { label: 'Available', dot: 'bg-green-500' },
  busy: { label: 'Busy', dot: 'bg-red-500' },
  away: { label: 'Away', dot: 'bg-amber-500' },
}
