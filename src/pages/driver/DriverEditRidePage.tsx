import type { ReactNode } from 'react'
import { useParams } from 'react-router'
import { FormAlert } from '@/components/form'
import { PageHeader } from '@/components/page'
import { Skeleton } from '@/components/ui/skeleton'
import { RideForm, RideNotFound } from '@/features/driver/rides/components/RideForm'
import { useMyRides } from '@/features/driver/rides/hooks/useMyRides'
import { useMyVehicles } from '@/features/driver/vehicles/hooks/useMyVehicles'

export function DriverEditRidePage() {
  const { id } = useParams()
  const rides = useMyRides()
  const vehicles = useMyVehicles()

  // There's no "get one ride" endpoint for drivers: find it in My Rides (usually already cached).
  const ride = rides.data?.find((r) => r.id === id)
  const approved = vehicles.data?.filter((vehicle) => vehicle.status === 'APPROVED')
  const error = rides.error ?? vehicles.error

  let content: ReactNode
  if (error) content = <FormAlert>{error.message}</FormAlert>
  else if (!rides.data || !approved) content = <Skeleton className="h-96 max-w-2xl rounded-xl" />
  else if (!ride) content = <RideNotFound />
  else content = <RideForm ride={ride} vehicles={approved} />

  return (
    <>
      <PageHeader
        title="Edit ride"
        description="Change the route, time, fare or vehicle. Only possible while nobody has booked a seat."
      />
      <div className="flex flex-col gap-4 p-6">{content}</div>
    </>
  )
}
