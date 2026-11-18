import { z } from 'zod'
import { vehicleSchema, type VehicleStatus } from '@/features/shared/vehicles/api/vehicleSchema'

// The admin review queue adds the owner and a fingerprint to send back when reviewing.
export const adminVehicleSchema = vehicleSchema.extend({
  owner: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  reviewVersion: z.string(),
})
export type AdminVehicle = z.infer<typeof adminVehicleSchema>

// Query parameters of GET /api/admin/vehicles. Oldest first. No status means PENDING (server default).
export type ListVehiclesParams = {
  page?: number
  pageSize?: number
  status?: VehicleStatus
}

export type VehicleFilters = Omit<ListVehiclesParams, 'page' | 'pageSize'>

// Body of PATCH /api/admin/vehicles/{id}/review. `note` is required (max 500) when REJECTED.
// A plain type: the dialog builds it and already checks the note.
export type ReviewVehicleBody = {
  decision: 'APPROVED' | 'REJECTED'
  reviewVersion: string // copied from the list: the server refuses (409) if the vehicle changed since
  note?: string
}

export const REVIEW_NOTE_MAX = 500

// The reject form: the note the owner will read. Approving has no form fields.
export const rejectFormSchema = z.object({
  note: z.string().trim().min(1, 'Write why you are rejecting it').max(REVIEW_NOTE_MAX),
})
