import { vehicleStatusSchema } from '@/features/shared/vehicles/api/vehicleSchema'
import type { VehicleFilters } from '../api/vehiclesSchema'

export const VEHICLE_STATUSES = vehicleStatusSchema.options

// PENDING is the server's default, so it stays out of the URL (like page 1).
export function readVehicleFilters(params: URLSearchParams): VehicleFilters {
  const status = VEHICLE_STATUSES.find((s) => s === params.get('status'))
  return { status: status === 'PENDING' ? undefined : status }
}
