import { FormAlert } from '@/components/form'
import { PageHeader } from '@/components/page'
import { MyBookingsList } from '@/features/rider/bookings/components/MyBookingsList'
import { useMyBookings } from '@/features/rider/bookings/hooks/useMyBookings'

export function RiderBookingsPage() {
  const { data, isError, error } = useMyBookings()

  return (
    <>
      <PageHeader title="My Bookings" description="Your seats on other drivers' rides." />

      <div className="flex flex-col gap-4 p-6">
        {isError ? <FormAlert>{error.message}</FormAlert> : <MyBookingsList bookings={data} />}
      </div>
    </>
  )
}
