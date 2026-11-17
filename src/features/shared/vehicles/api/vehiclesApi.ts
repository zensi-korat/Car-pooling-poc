import { api } from '@/services/api'
import { documentUrlSchema, type VehicleDocumentType } from './vehicleSchema'

// GET /api/vehicles/{id}/documents/{type} → { url } (the server also sends expiresInSeconds; we don't need it).
// Owner or admin. Every call is written to the audit log. 404 document not uploaded, 503 storage not configured.
export function getDocumentUrl(id: string, type: VehicleDocumentType, signal?: AbortSignal): Promise<{ url: string }> {
  return api(`/api/vehicles/${id}/documents/${type}`, { signal, schema: documentUrlSchema })
}
