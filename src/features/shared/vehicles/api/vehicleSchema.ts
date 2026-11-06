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
