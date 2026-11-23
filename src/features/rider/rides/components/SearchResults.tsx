import { CalendarClock, MapPin, SearchX, Ticket, Users } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { InfoTile, RouteLine } from '@/components/page'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/constants/routes'
import type { Ride } from '@/features/shared/rides/api/rideSchema'
import { formatDateTime, formatFare } from '@/lib/format'
import { cn } from '@/lib/utils'
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

type SearchResultsProps = Readonly<{
  rides: Ride[] | undefined // undefined = still searching
  selectedId: string | null
  onSelect: (id: string) => void
}>

export function SearchResults({ rides, selectedId, onSelect }: SearchResultsProps) {
  if (!rides) {
    return (
      <div className="grid gap-4">
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
      <div className="grid gap-4">
        {rides.map((ride) => (
          <RideResultCard key={ride.id} ride={ride} isSelected={ride.id === selectedId} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

type RideResultCardProps = Readonly<{ ride: Ride; isSelected: boolean; onSelect: (id: string) => void }>

function RideResultCard({ ride, isSelected, onSelect }: RideResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Picked on the map: bring the card into view (no scroll when it is already visible).
  useEffect(() => {
    if (isSelected) cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [isSelected])

  return (
    <Card ref={cardRef} className={cn(isSelected && 'ring-2 ring-primary')}>
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

      <CardFooter className="justify-end gap-2">
        <Button variant="outline" aria-pressed={isSelected} onClick={() => onSelect(ride.id)}>
          <MapPin data-icon="inline-start" />
          {isSelected ? 'Hide route' : 'Show on map'}
        </Button>
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
