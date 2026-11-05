import { readDateRange, readSearch } from '@/lib/filters'
import { roleSchema } from '@/features/auth/api/authSchema'
import type { UserFilters } from '../api/usersSchema'

export const ROLES = roleSchema.options

export function readUserFilters(params: URLSearchParams): UserFilters {
  const [joinedFrom, joinedTo] = readDateRange(params.get('joinedFrom'), params.get('joinedTo'))
  const role = ROLES.find((r) => r === params.get('role'))
  return { q: readSearch(params), role, joinedFrom, joinedTo }
}
