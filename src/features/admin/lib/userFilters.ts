// Reads the users-list filters from the URL. Anything unexpected is ignored,
// so a hand-typed URL can't send the server a filter it would reject (400).

import type { Role } from '@/features/auth/types'
import type { UserFilters } from '../types'

export const ROLES: Role[] = ['DRIVER', 'RIDER', 'ADMIN']

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function readUserFilters(params: URLSearchParams): UserFilters {
  // Raw text, spaces included, so the search box can show exactly what was typed.
  // The page trims it before sending.
  const q = params.get('q')?.slice(0, 100)
  const role = ROLES.find((r) => r === params.get('role'))
  const joinedFrom = readDate(params.get('joinedFrom'))
  let joinedTo = readDate(params.get('joinedTo'))
  // "to" before "from" is a 400 on the server: drop "to" instead.
  if (joinedFrom && joinedTo && joinedTo < joinedFrom) joinedTo = undefined

  return { q: q || undefined, role, joinedFrom, joinedTo }
}

export function hasFilters(filters: UserFilters): boolean {
  return Object.values(filters).some(Boolean)
}

function readDate(value: string | null): string | undefined {
  return value && DATE_PATTERN.test(value) ? value : undefined
}
