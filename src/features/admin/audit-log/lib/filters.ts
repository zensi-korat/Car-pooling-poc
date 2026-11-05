import { readDateRange } from '@/lib/filters'
import { auditEntityTypeSchema, type AuditLogFilters } from '../api/auditLogSchema'

export const AUDIT_ENTITY_TYPES = auditEntityTypeSchema.options
// Actions seen in the API docs' examples and real responses. The server has no full list yet (asked the backend).
export const AUDIT_ACTIONS = ['CREATED', 'CANCELLED', 'COMPLETED', 'APPROVED']

export function readAuditLogFilters(params: URLSearchParams): AuditLogFilters {
  const [from, to] = readDateRange(params.get('from'), params.get('to'))
  const entityType = AUDIT_ENTITY_TYPES.find((t) => t === params.get('entityType'))
  const action = AUDIT_ACTIONS.find((a) => a === params.get('action'))
  return { entityType, action, from, to }
}
