import type { ReactNode } from 'react'
import { StatusBadge, type Tone } from '@/components/page'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { AdminRide, RideStatus } from '../types'

const HEADINGS = ['Route', 'Driver', 'Departure', 'Seats', 'Fare', 'Vehicle', 'Status']
const SKELETON_ROWS = 5

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
  let rows: ReactNode
  if (!rides || isUpdating) rows = <SkeletonRows />
  else if (rides.length === 0) rows = <MessageRow>No rides found.</MessageRow>
  else rows = rides.map((ride) => <RideRow key={ride.id} ride={ride} />)

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table aria-busy={isUpdating}>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {HEADINGS.map((heading) => (
              <TableHead key={heading} className="px-4">
                {heading}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{rows}</TableBody>
      </Table>
      {footer}
    </div>
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

function TwoLines({ main, sub }: Readonly<{ main: string; sub: string }>) {
  return (
    <div className="flex flex-col">
      <span className="font-medium">{main}</span>
      <span className="text-xs text-muted-foreground">{sub}</span>
    </div>
  )
}

function SkeletonRows() {
  return Array.from({ length: SKELETON_ROWS }, (_, row) => (
    <TableRow key={row}>
      {HEADINGS.map((heading) => (
        <TableCell key={heading} className="px-4 py-3">
          <Skeleton className="h-4 w-24" />
        </TableCell>
      ))}
    </TableRow>
  ))
}

function MessageRow({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <TableRow>
      <TableCell colSpan={HEADINGS.length} className="h-24 text-center text-muted-foreground">
        {children}
      </TableCell>
    </TableRow>
  )
}
