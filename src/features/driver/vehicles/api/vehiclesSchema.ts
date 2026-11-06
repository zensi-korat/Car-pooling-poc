import { z } from 'zod'

export const SEAT_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8']

// The add-vehicle form. Seats stay text here (a Select's value); the body turns them into a number.
// The plate format is checked by the server (spaces and dashes are ignored there).
export const vehicleFormSchema = z.object({
  make: z.string().trim().min(1, 'Make is required'),
  model: z.string().trim().min(1, 'Model is required'),
  colour: z.string().trim().min(1, 'Colour is required'),
  plateNumber: z.string().trim().min(1, 'Plate number is required'),
  seatCapacity: z.string().min(1, 'Choose the number of seats'),
})
export type VehicleFormValues = z.infer<typeof vehicleFormSchema>

// Body of POST /api/vehicles.
export type CreateVehicleBody = {
  make: string
  model: string
  colour: string
  plateNumber: string
  seatCapacity: number // passenger seats, 1-8
}

// Body of PATCH /api/vehicles/{id}: only the fields that changed (an empty body is a 400).
export type UpdateVehicleBody = Partial<CreateVehicleBody>

// GET /api/vehicles/{id}/documents/{type}: a signed link that works for 60 seconds and forces a download.
export const documentUrlSchema = z.object({ url: z.string() })
