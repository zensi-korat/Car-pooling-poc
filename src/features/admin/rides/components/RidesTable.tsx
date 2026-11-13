import type { ReactNode } from 'react'
import { RideStatusBadge } from '@/components/badges'
import { ListTable, TwoLines } from '@/components/page'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatDateTime, formatFare } from '@/lib/format'
import type { AdminRide } from '../api/ridesSchema'

const HEADINGS = ['Route', 'Driver', 'Departure', 'Seats', 'Fare', 'Vehicle', 'Status']

type RidesTableProps = Readonly<{
  rides: AdminRide[] | undefined
  isUpdating?: boolean
  footer?: ReactNode
}>

export function RidesTable({ rides, isUpdating, footer }: RidesTableProps) {
  return (
    <ListTable
      headings={HEADINGS}
      items={rides}
      isUpdating={isUpdating}
      emptyMessage="No rides found."
      renderRow={(ride) => <RideRow ride={ride} />}
      footer={footer}
    />
  )
}

function RideRow({ ride }: Readonly<{ ride: AdminRide }>) {
  return (
    <TableRow>
      <TableCell className="px-4">
        <TwoLines main={ride.originLabel} sub={`→ ${ride.destLabel}`} />
      </TableCell>
      <TableCell className="px-4">
        <TwoLines main={ride.driver.name} sub={ride.driver.email} />
      </TableCell>
      <TableCell className="px-4 text-muted-foreground">{formatDateTime(ride.departureTime)}</TableCell>
      <TableCell className="px-4 text-muted-foreground">
        {ride.seatsAvailable} of {ride.totalSeats} left
      </TableCell>
      <TableCell className="px-4 font-medium">{formatFare(ride.estimatedCost)}</TableCell>
      <TableCell className="px-4">
        {ride.vehicle ? (
          <TwoLines main={`${ride.vehicle.make} ${ride.vehicle.model}`} sub={ride.vehicle.plate} />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="px-4">
        <RideStatusBadge status={ride.status} />
      </TableCell>
    </TableRow>
  )
}
