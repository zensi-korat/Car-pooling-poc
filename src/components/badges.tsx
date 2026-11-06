import type { ReactNode } from 'react'
import { BadgeCheck, Check, Clock, X } from 'lucide-react'
import type { Role } from '@/features/auth/api/authSchema'
import {
  vehicleDocumentTypeSchema,
  type Vehicle,
  type VehicleDocumentType,
  type VehicleStatus,
} from '@/features/shared/vehicles/api/vehicleSchema'
import { humanize } from '@/lib/text'

const TONES = {
  neutral: 'bg-muted text-muted-foreground',
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export type Tone = keyof typeof TONES

type StatusBadgeProps = Readonly<{ tone?: Tone; children: ReactNode }>

export function StatusBadge({ tone = 'neutral', children }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium [&>svg]:size-3 ${TONES[tone]}`}
    >
      {children}
    </span>
  )
}

const ROLE_TONES: Record<Role, Tone> = {
  ADMIN: 'purple',
  DRIVER: 'blue',
  RIDER: 'green',
}

export function RoleBadge({ role }: Readonly<{ role: Role }>) {
  return <StatusBadge tone={ROLE_TONES[role]}>{role}</StatusBadge>
}

export function VerifiedBadge({ verified }: Readonly<{ verified: boolean }>) {
  return verified ? (
    <StatusBadge tone="green">
      <BadgeCheck /> Verified
    </StatusBadge>
  ) : (
    <StatusBadge tone="amber">
      <Clock /> Not verified
    </StatusBadge>
  )
}

const VEHICLE_STATUS_TONES: Record<VehicleStatus, Tone> = {
  PENDING: 'amber',
  APPROVED: 'green',
  REJECTED: 'red',
}

export function VehicleStatusBadge({ status }: Readonly<{ status: VehicleStatus }>) {
  return <StatusBadge tone={VEHICLE_STATUS_TONES[status]}>{status}</StatusBadge>
}

const DOCUMENT_LABELS: Record<VehicleDocumentType, string> = {
  RC: 'RC',
  LICENCE: 'Licence',
}

// One badge per required document: green tick if uploaded, red cross if not.
export function VehicleDocumentBadges({ documents }: Readonly<{ documents: Vehicle['documents'] }>) {
  return (
    <span className="flex gap-1">
      {vehicleDocumentTypeSchema.options.map((type) =>
        documents.some((document) => document.type === type) ? (
          <StatusBadge key={type} tone="green">
            <Check /> {DOCUMENT_LABELS[type]}
          </StatusBadge>
        ) : (
          <StatusBadge key={type} tone="red">
            <X /> {DOCUMENT_LABELS[type]}
          </StatusBadge>
        ),
      )}
    </span>
  )
}

// The server may add new actions, so unknown ones fall back to amber.
const AUDIT_ACTION_TONES: Record<string, Tone> = {
  CREATED: 'blue',
  CANCELLED: 'red',
  COMPLETED: 'green',
  APPROVED: 'purple',
}

export function AuditActionBadge({ action }: Readonly<{ action: string }>) {
  return <StatusBadge tone={AUDIT_ACTION_TONES[action] ?? 'amber'}>{humanize(action)}</StatusBadge>
}
