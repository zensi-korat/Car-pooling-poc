import { useRef, type ChangeEvent } from 'react'
import { Check, Download, FileUp, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/badges'
import { FormAlert } from '@/components/form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  vehicleDocumentTypeSchema,
  type Vehicle,
  type VehicleDocumentType,
} from '@/features/shared/vehicles/api/vehicleSchema'
import { useDownloadDocument } from '../hooks/useDownloadDocument'
import { useUploadDocument } from '../hooks/useUploadDocument'

const LABELS: Record<VehicleDocumentType, string> = {
  RC: 'RC (registration certificate)',
  LICENCE: 'Driving licence',
}

const uploadedFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
})

export function VehicleDocumentsDialog({ vehicle }: Readonly<{ vehicle: Vehicle }>) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Documents for ${vehicle.make} ${vehicle.model}`}>
          <FileUp />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Documents · {vehicle.make} {vehicle.model}
          </DialogTitle>
          <DialogDescription>
            JPEG, PNG or PDF, up to 5 MB. Replacing a file sends the vehicle for review again.
          </DialogDescription>
        </DialogHeader>

        {vehicleDocumentTypeSchema.options.map((type) => (
          <DocumentRow
            key={type}
            vehicleId={vehicle.id}
            type={type}
            uploadedAt={vehicle.documents.find((document) => document.type === type)?.uploadedAt}
          />
        ))}
      </DialogContent>
    </Dialog>
  )
}

type DocumentRowProps = Readonly<{
  vehicleId: string
  type: VehicleDocumentType
  uploadedAt: string | undefined
}>

function DocumentRow({ vehicleId, type, uploadedAt }: DocumentRowProps) {
  const upload = useUploadDocument()
  const download = useDownloadDocument()
  const error = upload.error ?? download.error
  const fileInput = useRef<HTMLInputElement>(null)

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Clear the picker, so choosing the same file again still triggers onChange.
    event.target.value = ''
    if (!file) return
    upload.mutate({ id: vehicleId, type, file }, { onSuccess: () => toast.success(`${LABELS[type]} uploaded`) })
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-sm font-medium">{LABELS[type]}</span>
          {uploadedAt ? (
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <StatusBadge tone="green">
                <Check /> Uploaded
              </StatusBadge>
              {uploadedFormat.format(new Date(uploadedAt))}
            </span>
          ) : (
            <span>
              <StatusBadge>Not uploaded</StatusBadge>
            </span>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          {uploadedAt && (
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={`Download ${LABELS[type]}`}
              title="Download"
              onClick={() => download.mutate({ id: vehicleId, type })}
              disabled={download.isPending}
            >
              {download.isPending ? <Loader2 className="animate-spin" /> : <Download />}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => fileInput.current?.click()} disabled={upload.isPending}>
            {upload.isPending ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Upload data-icon="inline-start" />
            )}
            {uploadedAt ? 'Replace' : 'Upload'}
          </Button>
        </div>
        <Input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {error && <FormAlert>{error.message}</FormAlert>}
    </div>
  )
}
