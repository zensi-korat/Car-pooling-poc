import type { ReactNode } from 'react'
import { Check, X } from 'lucide-react'
import { ListTable, StatusBadge, TwoLines, type Tone } from '@/components/page'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { useCurrentUser } from '@/features/auth/useAuth'
import type { AdminVehicle, VehicleDocumentType, VehicleStatus } from '../api/vehiclesSchema'
import type { Review } from './ReviewVehicleDialog'

const HEADINGS = ['Vehicle', 'Owner', 'Seats', 'Documents', 'Submitted', 'Status', 'Review']

const DOCUMENTS: { type: VehicleDocumentType; label: string }[] = [
  { type: 'RC', label: 'RC' },
  { type: 'LICENCE', label: 'Licence' },
]

const STATUS_TONES: Record<VehicleStatus, Tone> = {
  PENDING: 'amber',
  APPROVED: 'green',
  REJECTED: 'red',
}

const submittedFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
})

type VehiclesTableProps = Readonly<{
  vehicles: AdminVehicle[] | undefined
  isUpdating?: boolean
  footer?: ReactNode
  onReview: (review: Review) => void
}>

export function VehiclesTable({ vehicles, isUpdating, footer, onReview }: VehiclesTableProps) {
  const currentUser = useCurrentUser()

  return (
    <ListTable
      headings={HEADINGS}
      items={vehicles}
      isUpdating={isUpdating}
      emptyMessage="No vehicles here."
      renderRow={(vehicle) => (
        <VehicleRow vehicle={vehicle} isOwn={vehicle.owner.id === currentUser.id} onReview={onReview} />
      )}
      footer={footer}
    />
  )
}

type VehicleRowProps = Readonly<{
  vehicle: AdminVehicle
  isOwn: boolean
  onReview: (review: Review) => void
}>

function VehicleRow({ vehicle, isOwn, onReview }: VehicleRowProps) {
  return (
    <TableRow>
      <TableCell className="px-4">
        <TwoLines main={`${vehicle.make} ${vehicle.model}`} sub={`${vehicle.plateNumber} · ${vehicle.colour}`} />
      </TableCell>
      <TableCell className="px-4">
        <TwoLines main={vehicle.owner.name} sub={vehicle.owner.email} />
      </TableCell>
      <TableCell className="px-4 text-muted-foreground">{vehicle.seatCapacity}</TableCell>
      <TableCell className="px-4">
        <span className="flex gap-1">
          {DOCUMENTS.map(({ type, label }) =>
            vehicle.documents.some((document) => document.type === type) ? (
              <StatusBadge key={type} tone="green">
                <Check /> {label}
              </StatusBadge>
            ) : (
              <StatusBadge key={type} tone="red">
                <X /> {label}
              </StatusBadge>
            ),
          )}
        </span>
      </TableCell>
      <TableCell className="px-4 text-muted-foreground">
        {submittedFormat.format(new Date(vehicle.createdAt))}
      </TableCell>
      <TableCell className="px-4">
        <TwoLines
          main={<StatusBadge tone={STATUS_TONES[vehicle.status]}>{vehicle.status}</StatusBadge>}
          sub={vehicle.rejectionNote}
        />
      </TableCell>
      <TableCell className="px-4">
        {vehicle.status === 'PENDING' ? (
          <ReviewButtons vehicle={vehicle} isOwn={isOwn} onReview={onReview} />
        ) : (
          <span className="text-muted-foreground">
            {vehicle.reviewedAt ? submittedFormat.format(new Date(vehicle.reviewedAt)) : '—'}
          </span>
        )}
      </TableCell>
    </TableRow>
  )
}

// Disabled up front where the server would refuse anyway (403 own vehicle, 409 missing documents).
function ReviewButtons({ vehicle, isOwn, onReview }: VehicleRowProps) {
  const hasAllDocuments = DOCUMENTS.every(({ type }) => vehicle.documents.some((document) => document.type === type))
  let approveHint: string | undefined
  if (isOwn) approveHint = "You can't review your own vehicle."
  else if (!hasAllDocuments) approveHint = 'RC and licence must both be uploaded first.'

  return (
    <span className="flex gap-2" title={approveHint}>
      <Button
        size="sm"
        disabled={isOwn || !hasAllDocuments}
        onClick={() => onReview({ vehicle, decision: 'APPROVED' })}
      >
        Approve
      </Button>
      <Button size="sm" variant="outline" disabled={isOwn} onClick={() => onReview({ vehicle, decision: 'REJECTED' })}>
        Reject
      </Button>
    </span>
  )
}
