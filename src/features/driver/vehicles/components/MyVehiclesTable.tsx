import { VehicleDocumentBadges, VehicleStatusBadge } from '@/components/badges'
import { ListTable, TwoLines } from '@/components/page'
import { TableCell, TableRow } from '@/components/ui/table'
import type { Vehicle } from '@/features/shared/vehicles/api/vehicleSchema'
import { VehicleDocumentsDialog } from './VehicleDocumentsDialog'
import { VehicleFormDialog } from './VehicleFormDialog'

const HEADINGS = ['Vehicle', 'Seats', 'Documents', 'Added', 'Status', 'Actions']

const addedFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
})

export function MyVehiclesTable({ vehicles }: Readonly<{ vehicles: Vehicle[] | undefined }>) {
  return (
    <ListTable
      headings={HEADINGS}
      items={vehicles}
      emptyMessage="No vehicles yet."
      renderRow={(vehicle) => (
        <TableRow>
          <TableCell className="px-4">
            <TwoLines main={`${vehicle.make} ${vehicle.model}`} sub={`${vehicle.plateNumber} · ${vehicle.colour}`} />
          </TableCell>
          <TableCell className="px-4 text-muted-foreground">{vehicle.seatCapacity}</TableCell>
          <TableCell className="px-4">
            <VehicleDocumentBadges documents={vehicle.documents} />
          </TableCell>
          <TableCell className="px-4 text-muted-foreground">
            {addedFormat.format(new Date(vehicle.createdAt))}
          </TableCell>
          <TableCell className="px-4">
            <TwoLines main={<VehicleStatusBadge status={vehicle.status} />} sub={vehicle.rejectionNote} />
          </TableCell>
          <TableCell className="px-4">
            <div className="flex gap-1">
              <VehicleDocumentsDialog vehicle={vehicle} />
              <VehicleFormDialog vehicle={vehicle} />
            </div>
          </TableCell>
        </TableRow>
      )}
    />
  )
}
