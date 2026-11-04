import { useSearchParams } from 'react-router'
import { FormAlert } from '@/components/form'
import { PageHeader, TablePagination } from '@/components/page'
import { UsersFilters } from '@/features/admin/components/UsersFilters'
import { UsersTable } from '@/features/admin/components/UsersTable'
import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers'
import { hasFilters, readUserFilters } from '@/features/admin/lib/userFilters'
import type { UserFilters } from '@/features/admin/types'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { DEFAULT_PAGE_SIZE, readPage, readPageSize } from '@/lib/pagination'

export function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = readPage(searchParams.get('page'))
  const pageSize = readPageSize(searchParams.get('pageSize'))
  const filters = readUserFilters(searchParams)
  const q = useDebouncedValue(filters.q?.trim() || undefined)

  const { data, isError, error, isPlaceholderData } = useAdminUsers({ page, pageSize, ...filters, q })

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

  function handleFiltersChange(changes: UserFilters) {
    updateUrl({ ...changes, page: undefined }, 'q' in changes)
  }

  let description = 'Everyone who has signed up, newest first.'
  if (data) description = hasFilters(filters) ? `${data.total} users match.` : `${data.total} users, newest first.`

  return (
    <>
      <PageHeader title="Users" description={description} />

      <div className="flex flex-col gap-4 p-6">
        <UsersFilters filters={filters} onChange={handleFiltersChange} />

        {isError ? (
          <FormAlert>{error.message}</FormAlert>
        ) : (
          <UsersTable
            users={data?.items}
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
