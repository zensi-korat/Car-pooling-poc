import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listAuditLogs } from '../api/auditLogApi'
import type { ListAuditLogsParams } from '../api/auditLogSchema'

// One page of audit entries for the admin table. Same caching rules as useAdminUsers.
export function useAdminAuditLogs(params: ListAuditLogsParams) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: ({ signal }) => listAuditLogs(params, signal),
    placeholderData: keepPreviousData,
  })
}
