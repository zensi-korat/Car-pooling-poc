import { api, pageSchema, type Page } from '@/services/api'
import { adminRideSchema, type AdminRide, type ListRidesParams } from './ridesSchema'

const ridesPageSchema = pageSchema(adminRideSchema)

// GET /api/admin/rides?page=1&status=SCHEDULED&departureFrom=2026-11-01 → one page of rides, newest first.
// 400 invalid filter (unknown status, bad dates, pageSize over 200), 403 not an admin.
export function listRides(params: ListRidesParams, signal?: AbortSignal): Promise<Page<AdminRide>> {
  return api('/api/admin/rides', { params, signal, schema: ridesPageSchema })
}
