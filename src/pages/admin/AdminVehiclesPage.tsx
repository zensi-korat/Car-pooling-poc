import { useState } from 'react'
import { FormAlert } from '@/components/form'
import { PageHeader, TablePagination } from '@/components/page'
import { ReviewVehicleDialog, type Review } from '@/features/admin/vehicles/components/ReviewVehicleDialog'
import { VehiclesFilters } from '@/features/admin/vehicles/components/VehiclesFilters'
import { VehiclesTable } from '@/features/admin/vehicles/components/VehiclesTable'
import { useAdminVehicles } from '@/features/admin/vehicles/hooks/useAdminVehicles'
import { readVehicleFilters } from '@/features/admin/vehicles/lib/filters'
import type { VehicleStatus } from '@/features/shared/vehicles/api/vehicleSchema'
import { useListParams } from '@/hooks/useListParams'

const DESCRIPTIONS: Record<VehicleStatus, (total: number) => string> = {
  PENDING: (total) => `${total} waiting for review, oldest first.`,
  APPROVED: (total) => `${total} approved, oldest first.`,
  REJECTED: (total) => `${total} rejected, oldest first.`,
}

export function AdminVehiclesPage() {
  const { page, pageSize, filters, setPage, setPageSize, setFilters } = useListParams(readVehicleFilters)

  const { data, isError, error, isPlaceholderData } = useAdminVehicles({ page, pageSize, ...filters })
  const [review, setReview] = useState<Review | null>(null)

  const description = data
    ? DESCRIPTIONS[filters.status ?? 'PENDING'](data.total)
    : 'Vehicles waiting for review, oldest first.'

  return (
    <>
      <PageHeader title="Vehicles" description={description}>
        <VehiclesFilters filters={filters} onChange={setFilters} />
      </PageHeader>

      <div className="flex flex-col gap-4 p-6">
        {isError ? (
          <FormAlert>{error.message}</FormAlert>
        ) : (
          <VehiclesTable
            vehicles={data?.items}
            isUpdating={isPlaceholderData}
            onReview={setReview}
            footer={
              data && (
                <TablePagination
                  page={page}
                  pageSize={pageSize}
                  total={data.total}
                  disabled={isPlaceholderData}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              )
            }
          />
        )}
      </div>

      <ReviewVehicleDialog review={review} onClose={() => setReview(null)} />
    </>
  )
}
