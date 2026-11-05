import type { z } from 'zod'
import { userSchema, type Role } from '@/features/auth/api/authSchema'

// The auth User minus phoneVerified: checked against a real response, the admin list doesn't send it
// (the API docs say it does; asked the backend).
export const adminUserSchema = userSchema.omit({ phoneVerified: true })
export type AdminUser = z.infer<typeof adminUserSchema>

// Query parameters of GET /api/admin/users. All optional; the server fills in defaults
// (page 1, pageSize 50, max 200). Filters combine with AND. Always newest first.
// Plain types: we build these ourselves, so there is nothing to check at runtime.
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
