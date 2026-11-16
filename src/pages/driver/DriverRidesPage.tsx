import { Plus } from 'lucide-react'
import { Link } from 'react-router'
import { FormAlert } from '@/components/form'
import { PageHeader } from '@/components/page'
import { Button } from '@/components/ui/button'
import { MyRidesList } from '@/features/driver/rides/components/MyRidesList'
import { useMyRides } from '@/features/driver/rides/hooks/useMyRides'
import { DEFAULT_TAB, readMyRideFilters } from '@/features/driver/rides/lib/filters'
import { useListParams } from '@/hooks/useListParams'

export function DriverRidesPage() {
  const { filters, setFilters } = useListParams(readMyRideFilters)
  const { data, isError, error } = useMyRides()

  return (
    <>
      <PageHeader title="My Rides" description="Your posted rides, who booked them, and what's next.">
        <Button asChild>
          <Link to="/driver/rides/new">
            <Plus data-icon="inline-start" />
            Post a ride
          </Link>
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-4 p-6">
        {isError ? (
          <FormAlert>{error.message}</FormAlert>
        ) : (
          <MyRidesList
            rides={data}
            status={filters.status ?? DEFAULT_TAB}
            onStatusChange={(status) => setFilters({ status: status === DEFAULT_TAB ? undefined : status })}
          />
        )}
      </div>
    </>
  )
}
