// Every admin request lives here. All of them answer 403 if the user isn't an ADMIN.

import { api } from '@/services/api'
import type { User } from '@/features/auth/types'
import type { AdminRide, ListRidesParams, ListUsersParams, Page } from '../types'

// GET /api/admin/users?page=1&pageSize=50&role=RIDER&q=asha → one page of users, newest first.
// 400 invalid filter (unknown role, bad dates, pageSize over 200), 403 not an admin.
export function listUsers(params: ListUsersParams, signal?: AbortSignal): Promise<Page<User>> {
  return api<Page<User>>('/api/admin/users', { params, signal })
}

// GET /api/admin/rides?page=1&status=SCHEDULED&departureFrom=2026-11-01 → one page of rides, newest first.
// 400 invalid filter (unknown status, bad dates, pageSize over 200), 403 not an admin.
export function listRides(params: ListRidesParams, signal?: AbortSignal): Promise<Page<AdminRide>> {
  return api<Page<AdminRide>>('/api/admin/rides', { params, signal })
}
