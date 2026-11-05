import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { FormAlert } from '@/components/form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useReviewVehicle } from '../hooks/useReviewVehicle'
import type { AdminVehicle, ReviewVehicleBody } from '../api/vehiclesSchema'

export type Review = { vehicle: AdminVehicle; decision: ReviewVehicleBody['decision'] }

const NOTE_MAX = 500

type ReviewVehicleDialogProps = Readonly<{
  review: Review | null
  onClose: () => void
}>

export function ReviewVehicleDialog({ review, onClose }: ReviewVehicleDialogProps) {
  const reviewVehicle = useReviewVehicle()
  const [note, setNote] = useState('')

  const isReject = review?.decision === 'REJECTED'
  const canSubmit = !reviewVehicle.isPending && (!isReject || note.trim() !== '')

  function close() {
    setNote('')
    reviewVehicle.reset()
    onClose()
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!review || !canSubmit) return
    reviewVehicle.mutate(
      {
        id: review.vehicle.id,
        decision: review.decision,
        reviewVersion: review.vehicle.reviewVersion,
        note: isReject ? note.trim() : undefined,
      },
      { onSuccess: close },
    )
  }

  return (
    <Dialog open={review !== null} onOpenChange={(open) => !open && !reviewVehicle.isPending && close()}>
      <DialogContent>
        {review && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>
                {isReject ? 'Reject' : 'Approve'} {review.vehicle.make} {review.vehicle.model}?
              </DialogTitle>
              <DialogDescription>
                {review.vehicle.plateNumber} · {review.vehicle.owner.name}. The owner will be emailed.
              </DialogDescription>
            </DialogHeader>

            {isReject && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="review-note">Reason for rejecting</Label>
                <Textarea
                  className="break-all resize-none"
                  id="review-note"
                  placeholder="e.g. The RC photo is blurry. Please upload a clearer one."
                  maxLength={NOTE_MAX}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={reviewVehicle.isPending}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  The owner sees this. {note.length}/{NOTE_MAX}
                </p>
              </div>
            )}

            {reviewVehicle.isError && <FormAlert>{reviewVehicle.error.message}</FormAlert>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={close} disabled={reviewVehicle.isPending}>
                Cancel
              </Button>
              <Button type="submit" variant={isReject ? 'destructive' : 'default'} disabled={!canSubmit}>
                {reviewVehicle.isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
                {isReject ? 'Reject' : 'Approve'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
