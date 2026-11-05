import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listAuditLogs } from '../api/adminApi'
import type { ListAuditLogsParams } from '../types'

// One page of audit entries for the admin table. Same caching rules as useAdminUsers.
export function useAdminAuditLogs(params: ListAuditLogsParams) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: ({ signal }) => listAuditLogs(params, signal),
    placeholderData: keepPreviousData,
  })
}
