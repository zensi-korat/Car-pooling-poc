// Every admin request lives here. All of them answer 403 if the user isn't an ADMIN.

import { api } from '@/services/api'
import type { User } from '@/features/auth/types'
import type { ListUsersParams, Page } from '../types'

// GET /api/admin/users?page=1&pageSize=50&role=RIDER&q=asha → one page of users, newest first.
// 400 invalid filter (unknown role, bad dates, pageSize over 200), 403 not an admin.
export function listUsers(params: ListUsersParams, signal?: AbortSignal): Promise<Page<User>> {
  return api<Page<User>>('/api/admin/users', { params, signal })
}
