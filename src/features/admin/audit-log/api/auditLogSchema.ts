import { z } from 'zod'

export const auditEntityTypeSchema = z.enum(['Ride', 'Booking', 'Vehicle'])
export type AuditEntityType = z.infer<typeof auditEntityTypeSchema>

// One line of the audit trail, written by the server on every ride/booking/vehicle change.
export const auditLogSchema = z.object({
  id: z.string(),
  entityType: auditEntityTypeSchema,
  entityId: z.string(), // id of the ride/booking/vehicle that changed
  action: z.string(), // e.g. "CANCELLED"; the API docs give examples, not a full list
  actorId: z.string(), // the user's id, or "system" for scheduled jobs
  metadata: z.record(z.string(), z.unknown()).nullable(), // differs per action, e.g. { reason: "AUTO_COMPLETED" }
  createdAt: z.string(),
})
export type AuditLog = z.infer<typeof auditLogSchema>

// Query parameters of GET /api/admin/audit-logs. Same paging as users. No search.
export type ListAuditLogsParams = {
  page?: number
  pageSize?: number
  entityType?: AuditEntityType
  action?: string // exact action name
  from?: string // YYYY-MM-DD (IST), inclusive
  to?: string // YYYY-MM-DD (IST), inclusive
}

export type AuditLogFilters = Omit<ListAuditLogsParams, 'page' | 'pageSize'>
