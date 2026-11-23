import { useState, type ReactNode } from 'react'
import { Ban, Phone, Users } from 'lucide-react'
import { BookingStatusBadge } from '@/components/badges'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { FormAlert } from '@/components/form'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import type { Ride } from '@/features/shared/rides/api/rideSchema'
import { formatDateTime, formatFare } from '@/lib/format'
import { initials } from '@/lib/text'
import { cn } from '@/lib/utils'
import type { RideBooking } from '../api/ridesSchema'
import { useCancelRideBooking } from '../hooks/useCancelRideBooking'
import { useRideBookings } from '../hooks/useRideBookings'

// canCancelBookings: the server's rule for cancelling a booking is the ride's own cancel rule.
type RideBookingsSheetProps = Readonly<{ ride: Ride; canCancelBookings: boolean }>

export function RideBookingsSheet({ ride, canCancelBookings }: RideBookingsSheetProps) {
  const [open, setOpen] = useState(false)
  const { data, isError, error } = useRideBookings(ride.id, open)
  const booked = ride.totalSeats - ride.seatsAvailable

  let content: ReactNode
  if (isError) {
    content = <FormAlert>{error.message}</FormAlert>
  } else if (!data) {
    content = Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-16 rounded-lg" />)
  } else if (data.length === 0) {
    content = (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users />
          </EmptyMedia>
          <EmptyTitle>No bookings yet</EmptyTitle>
          <EmptyDescription>Riders who book a seat will show up here.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  } else {
    // Confirmed riders first; the sort keeps the server's order otherwise.
    content = data
      .toSorted((a, b) => Number(a.status === 'CANCELLED') - Number(b.status === 'CANCELLED'))
      .map((booking) => (
        <BookingRow
          key={booking.id}
          booking={booking}
          canCancel={canCancelBookings && booking.status === 'CONFIRMED'}
        />
      ))
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Users data-icon="inline-start" />
          Riders
          <span className="text-muted-foreground tabular-nums">{booked}</span>
        </Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Riders</SheetTitle>
          <SheetDescription>
            {ride.originLabel} → {ride.destLabel} · {formatDateTime(ride.departureTime)}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-2 overflow-y-auto px-4 pb-4">{content}</div>
      </SheetContent>
    </Sheet>
  )
}

function BookingRow({ booking, canCancel }: Readonly<{ booking: RideBooking; canCancel: boolean }>) {
  const cancelled = booking.status === 'CANCELLED'
  const phone = booking.riderContact?.phone

  return (
    <div className={cn('flex items-center gap-3 rounded-xl border p-3', cancelled && 'bg-muted/50')}>
      <Avatar>
        <AvatarFallback>{initials(booking.riderName)}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn('truncate font-medium', cancelled && 'text-muted-foreground')}>{booking.riderName}</span>
        {phone && (
          <a href={`tel:${phone}`} className="flex w-fit items-center gap-1 text-xs hover:underline">
            <Phone className="size-3" />
            {phone}
          </a>
        )}
        <span className="text-xs text-muted-foreground">
          {cancelled && booking.cancelledAt
            ? `Cancelled ${formatDateTime(booking.cancelledAt)}`
            : `Booked ${formatDateTime(booking.createdAt)}`}
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        {!cancelled && <span className="font-medium tabular-nums">{formatFare(booking.costShare)}</span>}
        <BookingStatusBadge status={booking.status} />
        {canCancel && <CancelRideBookingButton booking={booking} />}
      </div>
    </div>
  )
}

function CancelRideBookingButton({ booking }: Readonly<{ booking: RideBooking }>) {
  const cancel = useCancelRideBooking()

  return (
    <ConfirmDialog
      Icon={Ban}
      variant="destructive"
      label="Cancel booking"
      title={`Cancel ${booking.riderName}'s booking?`}
      description="Their seat goes back to the ride and the other riders' shares are recalculated. The ride itself stays on. This can't be undone."
      dismissLabel="Keep booking"
      mutation={cancel}
      onConfirm={(close) => cancel.mutate(booking.id, { onSuccess: () => close('Booking cancelled') })}
    />
  )
}
