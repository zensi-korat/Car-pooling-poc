import { FormAlert } from '@/components/form'
import { PageHeader } from '@/components/page'
import { MyVehiclesTable } from '@/features/driver/vehicles/components/MyVehiclesTable'
import { VehicleFormDialog } from '@/features/driver/vehicles/components/VehicleFormDialog'
import { useMyVehicles } from '@/features/driver/vehicles/hooks/useMyVehicles'

export function DriverVehiclesPage() {
  const { data, isError, error } = useMyVehicles()

  return (
    <>
      <PageHeader title="My Vehicles" description="Register your vehicles and track their approval.">
        <VehicleFormDialog />
      </PageHeader>

      <div className="flex flex-col gap-4 p-6">
        {isError ? <FormAlert>{error.message}</FormAlert> : <MyVehiclesTable vehicles={data} />}
      </div>
    </>
  )
}
