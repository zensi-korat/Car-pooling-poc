import { z } from 'zod'

export const vehicleStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED'])
export type VehicleStatus = z.infer<typeof vehicleStatusSchema>

export const vehicleDocumentTypeSchema = z.enum(['RC', 'LICENCE'])
export type VehicleDocumentType = z.infer<typeof vehicleDocumentTypeSchema>

// The Vehicle schema. Note: the plate is `plateNumber` here, but `plate` on a ride's vehicle snapshot.
export const vehicleSchema = z.object({
  id: z.string(),
  make: z.string(),
  model: z.string(),
  colour: z.string(),
  plateNumber: z.string(), // normalised, e.g. "MH12AB1234"
  seatCapacity: z.number(), // passenger seats, excluding the driver (1-8)
  status: vehicleStatusSchema,
  rejectionNote: z.string().nullable(),
  reviewedAt: z.string().nullable(),
  createdAt: z.string(),
  // a missing document is simply not listed
  documents: z.array(z.object({ type: vehicleDocumentTypeSchema, uploadedAt: z.string() })),
})
export type Vehicle = z.infer<typeof vehicleSchema>

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
