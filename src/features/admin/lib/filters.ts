// Reads the admin list filters from the URL. Anything unexpected is ignored,
// so a hand-typed URL can't send the server a filter it would reject (400).

import type { Role } from '@/features/auth/types'
import type { RideFilters, RideStatus, UserFilters } from '../types'

export const ROLES: Role[] = ['DRIVER', 'RIDER', 'ADMIN']
export const RIDE_STATUSES: RideStatus[] = ['SCHEDULED', 'COMPLETED', 'CANCELLED']

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function readUserFilters(params: URLSearchParams): UserFilters {
  const [joinedFrom, joinedTo] = readDateRange(params.get('joinedFrom'), params.get('joinedTo'))
  const role = ROLES.find((r) => r === params.get('role'))
  return { q: readSearch(params), role, joinedFrom, joinedTo }
}

export function readRideFilters(params: URLSearchParams): RideFilters {
  const [departureFrom, departureTo] = readDateRange(params.get('departureFrom'), params.get('departureTo'))
  const status = RIDE_STATUSES.find((s) => s === params.get('status'))
  return { q: readSearch(params), status, departureFrom, departureTo }
}

export function hasFilters(filters: Record<string, unknown>): boolean {
  return Object.values(filters).some(Boolean)
}

// Raw text, spaces included, so the search box can show exactly what was typed.
// The page trims it before sending.
function readSearch(params: URLSearchParams): string | undefined {
  return params.get('q')?.slice(0, 100) || undefined
}

// "to" before "from" is a 400 on the server: drop "to" instead.
function readDateRange(from: string | null, to: string | null): [string | undefined, string | undefined] {
  const start = readDate(from)
  let end = readDate(to)
  if (start && end && end < start) end = undefined
  return [start, end]
}

function readDate(value: string | null): string | undefined {
  return value && DATE_PATTERN.test(value) ? value : undefined
}
