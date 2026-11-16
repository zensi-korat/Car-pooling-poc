import { useState } from 'react'
import { Ban, CalendarClock, Car, Phone, Ticket } from 'lucide-react'
import { BookingStatusBadge } from '@/components/badges'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { InfoTile, RouteLine } from '@/components/page'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import type { RideStatus } from '@/features/shared/rides/api/rideSchema'
import { isBeforeDepartureDay } from '@/lib/dates'
import { formatDateTime, formatFare } from '@/lib/format'
import type { RiderBooking } from '../api/bookingsSchema'
import { useCancelBooking } from '../hooks/useCancelBooking'

const RIDE_HINTS: Record<RideStatus, string | undefined> = {
  SCHEDULED: undefined,
  COMPLETED: 'Trip completed.',
  CANCELLED: 'The driver cancelled this ride.',
}

export function MyBookingsList({ bookings }: Readonly<{ bookings: RiderBooking[] | undefined }>) {
  // Read once when the page opens: decides which bookings can still be cancelled.
  const [now] = useState(() => new Date())

  if (!bookings) {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-64 rounded-xl" />
        ))}
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Ticket />
          </EmptyMedia>
          <EmptyTitle>No bookings yet</EmptyTitle>
          <EmptyDescription>Seats you book on a ride will show up here.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} now={now} />
      ))}
    </div>
  )
}

function BookingCard({ booking, now }: Readonly<{ booking: RiderBooking; now: Date }>) {
  const { ride, vehicle, driverContact } = booking
  const isOpen = booking.status === 'CONFIRMED' && ride.status === 'SCHEDULED'
  const canCancel = isOpen && isBeforeDepartureDay(ride.departureTime, now)

  let hint = RIDE_HINTS[ride.status]
  if (isOpen && !canCancel) hint = 'Departs today, so it can no longer be cancelled.'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="size-4 text-muted-foreground" />
          {formatDateTime(ride.departureTime)}
        </CardTitle>
        {hint && <CardDescription>{hint}</CardDescription>}
        <CardAction>
          <BookingStatusBadge status={booking.status} />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <RouteLine from={ride.originLabel} to={ride.destLabel} />
          <div className="flex shrink-0 flex-col items-end">
            <span className="text-xs text-muted-foreground">Your share</span>
            <span className="text-lg font-semibold tabular-nums">{formatFare(booking.costShare)}</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile Icon={Car} label="Vehicle">
            {vehicle ? (
              <>
                <span className="truncate font-medium">
                  {vehicle.make} {vehicle.model}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {vehicle.plate} · {vehicle.colour}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">Not available</span>
            )}
          </InfoTile>

          <InfoTile Icon={Phone} label="Driver">
            {driverContact ? (
              <>
                <span className="truncate font-medium">{driverContact.name}</span>
                <a href={`tel:${driverContact.phone}`} className="truncate text-xs text-muted-foreground underline">
                  {driverContact.phone}
                </a>
              </>
            ) : (
              <span className="text-muted-foreground">Shared once the booking is confirmed</span>
            )}
          </InfoTile>
        </div>
      </CardContent>

      {canCancel && (
        <CardFooter className="justify-end">
          <CancelBookingButton booking={booking} />
        </CardFooter>
      )}
    </Card>
  )
}

function CancelBookingButton({ booking }: Readonly<{ booking: RiderBooking }>) {
  const cancel = useCancelBooking()
  const { ride } = booking

  return (
    <ConfirmDialog
      Icon={Ban}
      variant="destructive"
      label="Cancel booking"
      title="Cancel this booking?"
      description={
        <>
          {ride.originLabel} → {ride.destLabel} on {formatDateTime(ride.departureTime)}. Your seat goes back to the
          ride. This can&apos;t be undone.
        </>
      }
      dismissLabel="Keep booking"
      mutation={cancel}
      onConfirm={(close) => cancel.mutate(booking.id, { onSuccess: () => close('Booking cancelled') })}
    />
  )
}
