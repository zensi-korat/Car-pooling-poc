import { useSearchParams } from 'react-router'
import { FormAlert } from '@/components/form'
import { PageHeader, TablePagination } from '@/components/page'
import { RidesFilters } from '@/features/admin/components/RidesFilters'
import { RidesTable } from '@/features/admin/components/RidesTable'
import { useAdminRides } from '@/features/admin/hooks/useAdminRides'
import { hasFilters, readRideFilters } from '@/features/admin/lib/filters'
import type { RideFilters } from '@/features/admin/types'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { DEFAULT_PAGE_SIZE, readPage, readPageSize } from '@/lib/pagination'

export function AdminRidesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = readPage(searchParams.get('page'))
  const pageSize = readPageSize(searchParams.get('pageSize'))
  const filters = readRideFilters(searchParams)
  const q = useDebouncedValue(filters.q?.trim() || undefined)

  const { data, isError, error, isPlaceholderData } = useAdminRides({ page, pageSize, ...filters, q })

  function updateUrl(changes: Record<string, string | undefined>, replace = false) {
    setSearchParams(
      (params) => {
        for (const [key, value] of Object.entries(changes)) {
          if (value) params.set(key, value)
          else params.delete(key)
        }
        return params
      },
      { replace },
    )
  }

  function handleFiltersChange(changes: RideFilters) {
    updateUrl({ ...changes, page: undefined }, 'q' in changes)
  }

  let description = 'Rides from every driver, newest first.'
  if (data) description = hasFilters(filters) ? `${data.total} rides match.` : `${data.total} rides, newest first.`

  return (
    <>
      <PageHeader title="Rides" description={description}>
        <RidesFilters filters={filters} onChange={handleFiltersChange} />
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
                  onPageChange={(next) => updateUrl({ page: next > 1 ? String(next) : undefined })}
                  onPageSizeChange={(size) =>
                    updateUrl({ page: undefined, pageSize: size === DEFAULT_PAGE_SIZE ? undefined : String(size) })
                  }
                />
              )
            }
          />
        )}
      </div>
    </>
  )
}
