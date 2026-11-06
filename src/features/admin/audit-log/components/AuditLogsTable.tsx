import type { ReactNode } from 'react'
import { AuditActionBadge, StatusBadge } from '@/components/badges'
import { ListTable } from '@/components/page'
import { TableCell, TableRow } from '@/components/ui/table'
import { humanize } from '@/lib/text'
import type { AuditLog } from '../api/auditLogSchema'

const HEADINGS = ['When', 'Entity', 'Action', 'By', 'Details']

const whenFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'Asia/Kolkata',
})

type AuditLogsTableProps = Readonly<{
  logs: AuditLog[] | undefined
  isUpdating?: boolean
  footer?: ReactNode
}>

export function AuditLogsTable({ logs, isUpdating, footer }: AuditLogsTableProps) {
  return (
    <ListTable
      headings={HEADINGS}
      items={logs}
      isUpdating={isUpdating}
      emptyMessage="No audit entries found."
      renderRow={(log) => <AuditLogRow log={log} />}
      footer={footer}
    />
  )
}

function AuditLogRow({ log }: Readonly<{ log: AuditLog }>) {
  return (
    <TableRow>
      <TableCell className="px-4 text-muted-foreground">{whenFormat.format(new Date(log.createdAt))}</TableCell>
      <TableCell className="px-4">
        <div className="flex flex-col">
          <span className="font-medium">{log.entityType}</span>
          <ShortId id={log.entityId} />
        </div>
      </TableCell>
      <TableCell className="px-4">
        <AuditActionBadge action={log.action} />
      </TableCell>
      <TableCell className="px-4">
        {log.actorId === 'system' ? <StatusBadge>System</StatusBadge> : <ShortId id={log.actorId} />}
      </TableCell>
      <TableCell className="px-4 text-muted-foreground">{describeMetadata(log.metadata)}</TableCell>
    </TableRow>
  )
}

function ShortId({ id }: Readonly<{ id: string }>) {
  return (
    <span title={id} className="font-mono text-xs text-muted-foreground">
      {id.slice(0, 8)}
    </span>
  )
}

// { reason: "AUTO_COMPLETED", seats: 2 } → "Reason: Auto completed · Seats: 2"
function describeMetadata(metadata: AuditLog['metadata']): string {
  const entries = Object.entries(metadata ?? {})
  if (entries.length === 0) return '—'
  return entries.map(([key, value]) => `${humanize(key)}: ${describeValue(value)}`).join(' · ')
}

function describeValue(value: unknown): string {
  if (typeof value === 'string') return /^[A-Z_]+$/.test(value) ? humanize(value) : value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}
