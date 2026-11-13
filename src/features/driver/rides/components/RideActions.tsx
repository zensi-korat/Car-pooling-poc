import { Ban, CircleCheck } from 'lucide-react'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import type { Ride } from '@/features/shared/rides/api/rideSchema'
import { formatDateTime } from '@/lib/format'
import { useCancelRide } from '../hooks/useCancelRide'
import { useCompleteRide } from '../hooks/useCompleteRide'

export function CancelRideButton({ ride }: Readonly<{ ride: Ride }>) {
  const cancel = useCancelRide()
  const booked = ride.totalSeats - ride.seatsAvailable

  return (
    <ConfirmDialog
      Icon={Ban}
      variant="destructive"
      label="Cancel ride"
      title="Cancel this ride?"
      description={
        <>
          {ride.originLabel} → {ride.destLabel} on {formatDateTime(ride.departureTime)}.{' '}
          {booked > 0 && `The ${booked} confirmed ${booked === 1 ? 'booking' : 'bookings'} will be cancelled too. `}
          This can&apos;t be undone.
        </>
      }
      dismissLabel="Keep ride"
      mutation={cancel}
      onConfirm={(close) => cancel.mutate(ride.id, { onSuccess: () => close('Ride cancelled') })}
    />
  )
}

export function CompleteRideButton({ ride }: Readonly<{ ride: Ride }>) {
  const complete = useCompleteRide()

  return (
    <ConfirmDialog
      Icon={CircleCheck}
      variant="default"
      label="Mark completed"
      title="Mark this ride as completed?"
      description={
        <>
          {ride.originLabel} → {ride.destLabel}. The ride is closed for good: no more bookings or cancellations.
        </>
      }
      dismissLabel="Not yet"
      mutation={complete}
      onConfirm={(close) => complete.mutate(ride.id, { onSuccess: () => close('Ride marked as completed') })}
    />
  )
}
