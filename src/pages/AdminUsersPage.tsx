import { FormAlert } from '@/components/form'
import { PageHeader, TablePagination } from '@/components/page'
import { UsersFilters } from '@/features/admin/components/UsersFilters'
import { UsersTable } from '@/features/admin/components/UsersTable'
import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers'
import { hasFilters, readUserFilters } from '@/features/admin/lib/filters'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useListParams } from '@/hooks/useListParams'

export function AdminUsersPage() {
  const { page, pageSize, filters, setPage, setPageSize, setFilters } = useListParams(readUserFilters)
  const q = useDebouncedValue(filters.q?.trim() || undefined)

  const { data, isError, error, isPlaceholderData } = useAdminUsers({ page, pageSize, ...filters, q })

  let description = 'Everyone who has signed up, newest first.'
  if (data) description = hasFilters(filters) ? `${data.total} users match.` : `${data.total} users, newest first.`

  return (
    <>
      <PageHeader title="Users" description={description}>
        <UsersFilters filters={filters} onChange={setFilters} />
      </PageHeader>

      <div className="flex flex-col gap-4 p-6">
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
