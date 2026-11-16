import { FormAlert } from '@/components/form'
import { PageHeader } from '@/components/page'
import { Skeleton } from '@/components/ui/skeleton'
import { NoApprovedVehicle, RideForm } from '@/features/driver/rides/components/RideForm'
import { useMyVehicles } from '@/features/driver/vehicles/hooks/useMyVehicles'

export function DriverPostRidePage() {
  const { data, isError, error } = useMyVehicles()
  const approved = data?.filter((vehicle) => vehicle.status === 'APPROVED')

  let content = <RideForm vehicles={approved ?? []} />
  if (isError) content = <FormAlert>{error.message}</FormAlert>
  else if (!approved) content = <Skeleton className="h-96 max-w-2xl rounded-xl" />
  else if (approved.length === 0) content = <NoApprovedVehicle />

  return (
    <>
      <PageHeader
        title="Post a ride"
        description="Choose the route, the time and the fare. Seats come from the vehicle."
      />
      <div className="flex flex-col gap-4 p-6">{content}</div>
    </>
  )
}
