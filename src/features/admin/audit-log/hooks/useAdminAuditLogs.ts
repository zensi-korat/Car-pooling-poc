import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { listAuditLogs } from '../api/auditLogApi'
import type { ListAuditLogsParams } from '../api/auditLogSchema'

// One page of audit entries for the admin table. Same caching rules as useAdminUsers.
export function useAdminAuditLogs(params: ListAuditLogsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.auditLogs(params),
    queryFn: ({ signal }) => listAuditLogs(params, signal),
    placeholderData: keepPreviousData,
  })
}
