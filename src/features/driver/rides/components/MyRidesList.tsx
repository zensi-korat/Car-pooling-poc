import { useState } from 'react'
import { Ban, CalendarClock, Car, CircleCheck, Route, Users, type LucideIcon } from 'lucide-react'
import { RideStatusBadge } from '@/components/badges'
import { InfoTile, RouteLine } from '@/components/page'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Ride, RideStatus } from '@/features/shared/rides/api/rideSchema'
import { formatDateTime, formatFare } from '@/lib/format'
import { getRideActions, ridesForTab } from '../lib/rides'
import { CancelRideButton, CompleteRideButton } from './RideActions'
import { RideBookingsSheet } from './RideBookingsSheet'

type Tab = { status: RideStatus; label: string; Icon: LucideIcon; emptyTitle: string; emptyText: string }

const TABS: Tab[] = [
  {
    status: 'SCHEDULED',
    label: 'Upcoming',
    Icon: Route,
    emptyTitle: 'No upcoming rides',
    emptyText: 'Rides you post will show up here.',
  },
  {
    status: 'COMPLETED',
    label: 'Completed',
    Icon: CircleCheck,
    emptyTitle: 'No completed rides yet',
    emptyText: 'Finished trips will be listed here.',
  },
  {
    status: 'CANCELLED',
    label: 'Cancelled',
    Icon: Ban,
    emptyTitle: 'No cancelled rides',
    emptyText: 'Rides you cancel will be listed here.',
  },
]

type MyRidesListProps = Readonly<{
  rides: Ride[] | undefined
  status: RideStatus
  onStatusChange: (status: RideStatus) => void
}>

export function MyRidesList({ rides, status, onStatusChange }: MyRidesListProps) {
  // Read once when the page opens: decides which actions each ride offers.
  const [now] = useState(() => new Date())

  function handleTabChange(value: string) {
    const tab = TABS.find((t) => t.status === value)
    if (tab) onStatusChange(tab.status)
  }

  return (
    <Tabs value={status} onValueChange={handleTabChange} className="gap-4">
      <TabsList>
        {TABS.map((tab) => (
          <TabsTrigger key={tab.status} value={tab.status} className="px-3">
            {tab.label}
            {rides && (
              <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground tabular-nums">
                {rides.filter((ride) => ride.status === tab.status).length}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {TABS.map((tab) => (
        <TabsContent key={tab.status} value={tab.status}>
          <RideCards rides={rides && ridesForTab(rides, tab.status)} tab={tab} now={now} />
        </TabsContent>
      ))}
    </Tabs>
  )
}

function RideCards({ rides, tab, now }: Readonly<{ rides: Ride[] | undefined; tab: Tab; now: Date }>) {
  if (!rides) {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-72 rounded-xl" />
        ))}
      </div>
    )
  }

  if (rides.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <tab.Icon />
          </EmptyMedia>
          <EmptyTitle>{tab.emptyTitle}</EmptyTitle>
          <EmptyDescription>{tab.emptyText}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {rides.map((ride) => (
        <RideCard key={ride.id} ride={ride} now={now} />
      ))}
    </div>
  )
}

function RideCard({ ride, now }: Readonly<{ ride: Ride; now: Date }>) {
  const { canCancel, canComplete } = getRideActions(ride, now)
  const booked = ride.totalSeats - ride.seatsAvailable

  let hint: string | undefined
  if (canComplete) hint = 'Departed. Mark it completed once the trip is over.'
  else if (ride.status === 'SCHEDULED' && !canCancel) hint = 'Departs today, so it can no longer be cancelled.'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="size-4 text-muted-foreground" />
          {formatDateTime(ride.departureTime)}
        </CardTitle>
        {hint && <CardDescription>{hint}</CardDescription>}
        <CardAction>
          <RideStatusBadge status={ride.status} />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <RouteLine from={ride.originLabel} to={ride.destLabel} />
          <div className="flex shrink-0 flex-col items-end">
            <span className="text-xs text-muted-foreground">Total fare</span>
            <span className="text-lg font-semibold tabular-nums">{formatFare(ride.estimatedCost)}</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile Icon={Car} label="Vehicle">
            {ride.vehicle ? (
              <>
                <span className="truncate font-medium">
                  {ride.vehicle.make} {ride.vehicle.model}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {ride.vehicle.plate} · {ride.vehicle.colour}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">Not available</span>
            )}
          </InfoTile>

          <InfoTile Icon={Users} label="Seats">
            <span className="flex items-baseline justify-between gap-2">
              <span className="font-medium">
                {booked} of {ride.totalSeats} booked
              </span>
              <span className="text-xs text-muted-foreground">{ride.seatsAvailable} left</span>
            </span>
            <Progress value={(booked / ride.totalSeats) * 100} aria-label="Seats booked" className="mt-1.5" />
          </InfoTile>
        </div>
      </CardContent>

      <CardFooter className="flex-wrap justify-end gap-2">
        <RideBookingsSheet ride={ride} />
        {canComplete && <CompleteRideButton ride={ride} />}
        {canCancel && <CancelRideButton ride={ride} />}
      </CardFooter>
    </Card>
  )
}
