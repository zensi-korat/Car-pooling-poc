import { FormAlert } from '@/components/form'
import { PageHeader, TablePagination } from '@/components/page'
import { AuditLogsFilters } from '@/features/admin/audit-log/components/AuditLogsFilters'
import { AuditLogsTable } from '@/features/admin/audit-log/components/AuditLogsTable'
import { useAdminAuditLogs } from '@/features/admin/audit-log/hooks/useAdminAuditLogs'
import { hasFilters } from '@/lib/filters'
import { readAuditLogFilters } from '@/features/admin/audit-log/lib/filters'
import { useListParams } from '@/hooks/useListParams'

export function AdminAuditLogsPage() {
  const { page, pageSize, filters, setPage, setPageSize, setFilters } = useListParams(readAuditLogFilters)

  const { data, isError, error, isPlaceholderData } = useAdminAuditLogs({ page, pageSize, ...filters })

  let description = 'Every change to rides, bookings and vehicles, newest first.'
  if (data) description = hasFilters(filters) ? `${data.total} entries match.` : `${data.total} entries, newest first.`

  return (
    <>
      <PageHeader title="Audit log" description={description}>
        <AuditLogsFilters filters={filters} onChange={setFilters} />
      </PageHeader>

      <div className="flex flex-col gap-4 p-6">
        {isError ? (
          <FormAlert>{error.message}</FormAlert>
        ) : (
          <AuditLogsTable
            logs={data?.items}
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
