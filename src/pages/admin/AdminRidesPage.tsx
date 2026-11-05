import { FormAlert } from '@/components/form'
import { PageHeader, TablePagination } from '@/components/page'
import { RidesFilters } from '@/features/admin/rides/components/RidesFilters'
import { RidesTable } from '@/features/admin/rides/components/RidesTable'
import { useAdminRides } from '@/features/admin/rides/hooks/useAdminRides'
import { hasFilters } from '@/lib/filters'
import { readRideFilters } from '@/features/admin/rides/lib/filters'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useListParams } from '@/hooks/useListParams'

export function AdminRidesPage() {
  const { page, pageSize, filters, setPage, setPageSize, setFilters } = useListParams(readRideFilters)
  const q = useDebouncedValue(filters.q?.trim() || undefined)

  const { data, isError, error, isPlaceholderData } = useAdminRides({ page, pageSize, ...filters, q })

  let description = 'Rides from every driver, newest first.'
  if (data) description = hasFilters(filters) ? `${data.total} rides match.` : `${data.total} rides, newest first.`

  return (
    <>
      <PageHeader title="Rides" description={description}>
        <RidesFilters filters={filters} onChange={setFilters} />
      </PageHeader>

      <div className="flex flex-col gap-4 p-6">
        {isError ? (
          <FormAlert>{error.message}</FormAlert>
        ) : (
          <RidesTable
            rides={data?.items}
            isUpdating={isPlaceholderData}
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
    </>
  )
}
