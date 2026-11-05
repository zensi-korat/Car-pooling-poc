import { api, pageSchema, type Page } from '@/services/api'
import { auditLogSchema, type AuditLog, type ListAuditLogsParams } from './auditLogSchema'

const auditLogsPageSchema = pageSchema(auditLogSchema)

// GET /api/admin/audit-logs?page=1&entityType=Ride&action=CANCELLED → one page of audit entries, newest first.
// 400 invalid filter (unknown entityType, bad dates, pageSize over 200), 403 not an admin.
export function listAuditLogs(params: ListAuditLogsParams, signal?: AbortSignal): Promise<Page<AuditLog>> {
  return api('/api/admin/audit-logs', { params, signal, schema: auditLogsPageSchema })
}
