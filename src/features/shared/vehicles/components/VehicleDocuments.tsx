import { useState } from 'react'
import { Download, Eye, FileText, Loader2 } from 'lucide-react'
import { VehicleDocumentBadge } from '@/components/badges'
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
import { cn } from '@/lib/utils'
import { vehicleDocumentTypeSchema, type Vehicle, type VehicleDocumentType } from '../api/vehicleSchema'
import { useDocumentUrl } from '../hooks/useDocumentUrl'
import { DOCUMENT_NAMES } from '../vehicles'

// The RC and licence badges. An uploaded one gets an eye button that opens a preview.
export function VehicleDocuments({ vehicle }: Readonly<{ vehicle: Vehicle }>) {
  return (
    <span className="flex gap-2">
      {vehicleDocumentTypeSchema.options.map((type) => {
        const uploaded = vehicle.documents.some((document) => document.type === type)
        return (
          <span key={type} className="flex items-center gap-0.5">
            <VehicleDocumentBadge type={type} uploaded={uploaded} />
            {uploaded && <DocumentPreviewDialog vehicle={vehicle} type={type} />}
          </span>
        )
      })}
    </span>
  )
}

type DocumentPreviewProps = Readonly<{ vehicle: Vehicle; type: VehicleDocumentType }>

function DocumentPreviewDialog({ vehicle, type }: DocumentPreviewProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Preview ${DOCUMENT_NAMES[type]}`}
          title={`Preview ${DOCUMENT_NAMES[type]}`}
        >
          <Eye />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{DOCUMENT_NAMES[type]}</DialogTitle>
          <DialogDescription>
            {vehicle.make} {vehicle.model} · {vehicle.plateNumber}
          </DialogDescription>
        </DialogHeader>
        <DocumentPreview vehicle={vehicle} type={type} />
      </DialogContent>
    </Dialog>
  )
}

// The link forces a download and the storage doesn't allow our page to fetch the file, so only
// an <img> can show it. When that fails (a PDF), offer the download instead.
function DocumentPreview({ vehicle, type }: DocumentPreviewProps) {
  const { data, error, isFetching } = useDocumentUrl(vehicle.id, type)
  const [image, setImage] = useState<'loading' | 'shown' | 'failed'>('loading')
  // While a new link is on its way, the cached one has expired: don't use it.
  const url = isFetching ? undefined : data?.url

  if (error) return <FormAlert>{error.message}</FormAlert>

  if (url && image === 'failed') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border p-8 text-center text-sm text-muted-foreground">
        <FileText className="size-8" aria-hidden />
        <p>This file can't be shown here. PDFs can only be downloaded for now.</p>
        <Button asChild variant="outline">
          <a href={url}>
            <Download data-icon="inline-start" />
            Download
          </a>
        </Button>
      </div>
    )
  }

  return (
    <>
      {image !== 'shown' && (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Loading document" />
        </div>
      )}
      {url && (
        <img
          src={url}
          alt={`${DOCUMENT_NAMES[type]} of ${vehicle.plateNumber}`}
          onLoad={() => setImage('shown')}
          onError={() => setImage('failed')}
          className={cn('max-h-[70vh] w-full rounded-lg border object-contain', image !== 'shown' && 'hidden')}
        />
      )}
    </>
  )
}
