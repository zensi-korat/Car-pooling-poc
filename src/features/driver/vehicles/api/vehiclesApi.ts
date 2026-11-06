import { z } from 'zod'
import { vehicleSchema, type Vehicle, type VehicleDocumentType } from '@/features/shared/vehicles/api/vehicleSchema'
import { api } from '@/services/api'
import { documentUrlSchema, type CreateVehicleBody, type UpdateVehicleBody } from './vehiclesSchema'

const vehiclesSchema = z.array(vehicleSchema)

// GET /api/vehicles/mine → all of the driver's vehicles (a plain array, not paginated). 403 not a driver.
export function listMyVehicles(signal?: AbortSignal): Promise<Vehicle[]> {
  return api('/api/vehicles/mine', { signal, schema: vehiclesSchema })
}

// POST /api/vehicles → the new vehicle, PENDING. 400 invalid input, 409 plate already registered.
export function createVehicle(body: CreateVehicleBody): Promise<Vehicle> {
  return api('/api/vehicles', { method: 'POST', body, schema: vehicleSchema })
}

// PATCH /api/vehicles/{id} → the updated vehicle. On an APPROVED vehicle, changing anything but the colour
// sends it back to PENDING. A REJECTED vehicle goes back to PENDING. 400 invalid, 409 plate already registered.
export function updateVehicle(id: string, body: UpdateVehicleBody): Promise<Vehicle> {
  return api(`/api/vehicles/${id}`, { method: 'PATCH', body, schema: vehicleSchema })
}

// POST /api/vehicles/{id}/documents (multipart) → the updated vehicle. A FormData body makes axios send
// multipart/form-data. JPEG, PNG or PDF, max 5 MB. Replaces the old file of that type; an APPROVED or
// REJECTED vehicle goes back to PENDING. 400 bad file, 503 storage not configured.
export function uploadVehicleDocument(id: string, type: VehicleDocumentType, file: File): Promise<Vehicle> {
  const form = new FormData()
  form.append('type', type)
  form.append('file', file)
  return api(`/api/vehicles/${id}/documents`, { method: 'POST', body: form, schema: vehicleSchema })
}

// GET /api/vehicles/{id}/documents/{type} → { url } (the server also sends expiresInSeconds; we don't need it). Every call is written to the audit log.
// 404 document not uploaded, 503 storage not configured.
export function getDocumentUrl(id: string, type: VehicleDocumentType): Promise<{ url: string }> {
  return api(`/api/vehicles/${id}/documents/${type}`, { schema: documentUrlSchema })
}
