import type { VehicleDocumentType } from './api/vehicleSchema'

export const DOCUMENT_NAMES: Record<VehicleDocumentType, string> = {
  RC: 'RC (registration certificate)',
  LICENCE: 'Driving licence',
}
