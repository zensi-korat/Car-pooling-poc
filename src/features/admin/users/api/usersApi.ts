import { api, pageSchema, type Page } from '@/services/api'
import { adminUserSchema, type AdminUser, type ListUsersParams } from './usersSchema'

const usersPageSchema = pageSchema(adminUserSchema)

// GET /api/admin/users?page=1&pageSize=50&role=RIDER&q=asha → one page of users, newest first.
// 400 invalid filter (unknown role, bad dates, pageSize over 200), 403 not an admin.
export function listUsers(params: ListUsersParams, signal?: AbortSignal): Promise<Page<AdminUser>> {
  return api('/api/admin/users', { params, signal, schema: usersPageSchema })
}
