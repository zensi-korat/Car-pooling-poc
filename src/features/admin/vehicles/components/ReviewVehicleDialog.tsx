import { revalidateLogic, useForm } from '@tanstack/react-form'
import { Loader2 } from 'lucide-react'
import { FormAlert, LabeledField } from '@/components/form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { REVIEW_NOTE_MAX, rejectFormSchema, type AdminVehicle, type ReviewVehicleBody } from '../api/vehiclesSchema'
import { useReviewVehicle } from '../hooks/useReviewVehicle'

export type Review = { vehicle: AdminVehicle; decision: ReviewVehicleBody['decision'] }

type ReviewVehicleDialogProps = Readonly<{
  review: Review | null
  onClose: () => void
}>

export function ReviewVehicleDialog({ review, onClose }: ReviewVehicleDialogProps) {
  const reviewVehicle = useReviewVehicle()
  const isReject = review?.decision === 'REJECTED'

  const form = useForm({
    defaultValues: { note: '' },
    validationLogic: revalidateLogic(),
    // Only a rejection needs a note.
    validators: { onDynamic: isReject ? rejectFormSchema : undefined },
    onSubmit: ({ value }) => {
      if (!review) return
      reviewVehicle.mutate(
        {
          id: review.vehicle.id,
          decision: review.decision,
          reviewVersion: review.vehicle.reviewVersion,
          note: isReject ? rejectFormSchema.parse(value).note : undefined,
        },
        { onSuccess: close },
      )
    },
  })

  function close() {
    form.reset()
    reviewVehicle.reset()
    onClose()
  }

  return (
    <Dialog open={review !== null} onOpenChange={(open) => !open && !reviewVehicle.isPending && close()}>
      <DialogContent>
        {review && (
          <form
            noValidate
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              void form.handleSubmit()
            }}
          >
            <DialogHeader>
              <DialogTitle>
                {isReject ? 'Reject' : 'Approve'} {review.vehicle.make} {review.vehicle.model}?
              </DialogTitle>
              <DialogDescription>
                {review.vehicle.plateNumber} · {review.vehicle.owner.name}. The owner will be emailed.
              </DialogDescription>
            </DialogHeader>

            {isReject && (
              <form.Field name="note">
                {(field) => (
                  <LabeledField
                    name={field.name}
                    label="Reason for rejecting"
                    description={`The owner sees this. ${field.state.value.length}/${REVIEW_NOTE_MAX}`}
                    errors={field.state.meta.errors}
                  >
                    <Textarea
                      id={field.name}
                      className="break-all resize-none"
                      placeholder="e.g. The RC photo is blurry. Please upload a clearer one."
                      maxLength={REVIEW_NOTE_MAX}
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                      disabled={reviewVehicle.isPending}
                      aria-invalid={!field.state.meta.isValid}
                      autoFocus
                    />
                  </LabeledField>
                )}
              </form.Field>
            )}

            {reviewVehicle.isError && <FormAlert>{reviewVehicle.error.message}</FormAlert>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={close} disabled={reviewVehicle.isPending}>
                Cancel
              </Button>
              <Button type="submit" variant={isReject ? 'destructive' : 'default'} disabled={reviewVehicle.isPending}>
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
