import type { ReactNode } from 'react'
import { StatusBadge, type Tone } from '@/components/badges'
import { ListTable, TwoLines } from '@/components/page'
import { TableCell, TableRow } from '@/components/ui/table'
import type { AdminRide, RideStatus } from '../api/ridesSchema'

const HEADINGS = ['Route', 'Driver', 'Departure', 'Seats', 'Fare', 'Vehicle', 'Status']

const STATUS_TONES: Record<RideStatus, Tone> = {
  SCHEDULED: 'blue',
  COMPLETED: 'green',
  CANCELLED: 'red',
}

const departureFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'Asia/Kolkata',
})

const fareFormat = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  trailingZeroDisplay: 'stripIfInteger',
})

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
      <TableCell className="px-4 text-muted-foreground">
        {departureFormat.format(new Date(ride.departureTime))}
      </TableCell>
      <TableCell className="px-4 text-muted-foreground">
        {ride.seatsAvailable} of {ride.totalSeats} left
      </TableCell>
      <TableCell className="px-4 font-medium">{fareFormat.format(Number(ride.estimatedCost))}</TableCell>
      <TableCell className="px-4">
        {ride.vehicle ? (
          <TwoLines main={`${ride.vehicle.make} ${ride.vehicle.model}`} sub={ride.vehicle.plate} />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="px-4">
        <StatusBadge tone={STATUS_TONES[ride.status]}>{ride.status}</StatusBadge>
      </TableCell>
    </TableRow>
  )
}
