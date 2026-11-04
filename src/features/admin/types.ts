import type { Role } from '@/features/auth/types'

// Every paginated admin list answers { items, total, page, pageSize }.
// <T> is the row type: Page<User> for users, later Page<Ride> for rides.
export type Page<T> = {
  items: T[]
  total: number // rows matching the filters, across ALL pages
  page: number
  pageSize: number
}

// Query parameters of GET /api/admin/users. All optional; the server fills in defaults
// (page 1, pageSize 50, max 200). Filters combine with AND. Always newest first.
export type ListUsersParams = {
  page?: number
  pageSize?: number
  role?: Role
  q?: string // case-insensitive match on name, email or phone
  joinedFrom?: string // YYYY-MM-DD (IST), inclusive
  joinedTo?: string // YYYY-MM-DD (IST), inclusive
}

// The filter part of ListUsersParams (everything except paging).
export type UserFilters = Omit<ListUsersParams, 'page' | 'pageSize'>
