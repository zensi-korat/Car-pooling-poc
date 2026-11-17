import { CalendarClock, SearchX, Ticket, Users } from 'lucide-react'
import { useNavigate } from 'react-router'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { InfoTile, RouteLine } from '@/components/page'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/constants/routes'
import type { Ride } from '@/features/shared/rides/api/rideSchema'
import { formatDateTime, formatFare } from '@/lib/format'
import { useBookSeat } from '../hooks/useBookSeat'

// Before the first search.
export function StartSearch() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Ticket />
        </EmptyMedia>
        <EmptyTitle>Where are you going?</EmptyTitle>
        <EmptyDescription>
          Choose where you start and where you're going to see the rides on that route.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

// rides undefined = still searching.
export function SearchResults({ rides }: Readonly<{ rides: Ride[] | undefined }>) {
  if (!rides) {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-48 rounded-xl" />
        ))}
      </div>
    )
  }

  if (rides.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX />
          </EmptyMedia>
          <EmptyTitle>No rides found</EmptyTitle>
          <EmptyDescription>
            Try other dates, or a place nearby: rides within 10 km of both places count.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        {rides.length} {rides.length === 1 ? 'ride' : 'rides'} found, soonest first.
      </p>
      <div className="grid gap-4 xl:grid-cols-2">
        {rides.map((ride) => (
          <RideResultCard key={ride.id} ride={ride} />
        ))}
      </div>
    </div>
  )
}

function RideResultCard({ ride }: Readonly<{ ride: Ride }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="size-4 text-muted-foreground" />
          {formatDateTime(ride.departureTime)}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <RouteLine from={ride.originLabel} to={ride.destLabel} />
          <div className="flex shrink-0 flex-col items-end">
            <span className="text-xs text-muted-foreground">Total fare</span>
            <span className="text-lg font-semibold tabular-nums">{formatFare(ride.estimatedCost)}</span>
            <span className="text-xs text-muted-foreground">split among riders</span>
          </div>
        </div>

        <InfoTile Icon={Users} label="Seats">
          <span className="font-medium">
            {ride.seatsAvailable} of {ride.totalSeats} free
          </span>
        </InfoTile>
      </CardContent>

      <CardFooter className="justify-end">
        <BookSeatButton ride={ride} />
      </CardFooter>
    </Card>
  )
}

function BookSeatButton({ ride }: Readonly<{ ride: Ride }>) {
  const bookSeat = useBookSeat()
  const navigate = useNavigate()

  return (
    <ConfirmDialog
      Icon={Ticket}
      variant="default"
      label="Book a seat"
      title="Book a seat on this ride?"
      description={
        <>
          {ride.originLabel} → {ride.destLabel} on {formatDateTime(ride.departureTime)}. Your share is the total fare
          split among the confirmed riders, so it drops as more people join. You get the driver&apos;s contact once
          it&apos;s booked.
        </>
      }
      dismissLabel="Not now"
      mutation={bookSeat}
      onConfirm={(close) =>
        bookSeat.mutate(ride.id, {
          onSuccess: () => {
            close('Seat booked')
            navigate(ROUTES.rider.bookings)
          },
        })
      }
    />
  )
}
