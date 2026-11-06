import { vehicleSchema, type Vehicle } from '@/features/shared/vehicles/api/vehicleSchema'
import { api, pageSchema, type Page } from '@/services/api'
import {
  adminVehicleSchema,
  type AdminVehicle,
  type ListVehiclesParams,
  type ReviewVehicleBody,
} from './vehiclesSchema'

const vehiclesPageSchema = pageSchema(adminVehicleSchema)

// GET /api/admin/vehicles?status=PENDING → one page of the review queue, oldest first.
// No status means PENDING. 403 not an admin.
export function listVehicles(params: ListVehiclesParams, signal?: AbortSignal): Promise<Page<AdminVehicle>> {
  return api('/api/admin/vehicles', { params, signal, schema: vehiclesPageSchema })
}

// PATCH /api/admin/vehicles/{id}/review → the updated vehicle. The owner is emailed.
// 400 missing note/version, 403 own vehicle, 404 not found,
// 409 not PENDING (another admin decided first), documents missing, or changed since reviewVersion.
export function reviewVehicle(id: string, body: ReviewVehicleBody): Promise<Vehicle> {
  return api(`/api/admin/vehicles/${id}/review`, { method: 'PATCH', body, schema: vehicleSchema })
}
