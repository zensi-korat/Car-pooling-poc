import { useRef, useState } from 'react'
import { revalidateLogic, useForm } from '@tanstack/react-form'
import { Loader2, Pencil, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { FormAlert, LabeledField } from '@/components/form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Vehicle } from '@/features/shared/vehicles/api/vehicleSchema'
import {
  SEAT_OPTIONS,
  vehicleFormSchema,
  type CreateVehicleBody,
  type UpdateVehicleBody,
  type VehicleFormValues,
} from '../api/vehiclesSchema'
import { useCreateVehicle } from '../hooks/useCreateVehicle'
import { useUpdateVehicle } from '../hooks/useUpdateVehicle'

// No vehicle → "Add" (empty form, POST). A vehicle → "Edit" (filled form, PATCH).
type VehicleFormDialogProps = Readonly<{ vehicle?: Vehicle }>

export function VehicleFormDialog({ vehicle }: VehicleFormDialogProps) {
  const createVehicle = useCreateVehicle()
  const updateVehicle = useUpdateVehicle()
  const save = vehicle ? updateVehicle : createVehicle
  const isSaving = save.isPending

  const [open, setOpen] = useState(false)

  function saved(message: string) {
    setOpen(false)
    toast.success(message)
  }
  const formRef = useRef<HTMLFormElement>(null)

  const form = useForm({
    defaultValues: startValues(vehicle),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: vehicleFormSchema },
    onSubmit: ({ value }) => {
      const body = toBody(value)
      const name = `${body.make} ${body.model}`

      if (!vehicle) {
        createVehicle.mutate(body, { onSuccess: () => saved(`${name} added`) })
        return
      }

      const changes = changedFields(vehicle, body)
      if (Object.keys(changes).length === 0) {
        setOpen(false)
        return
      }
      updateVehicle.mutate({ id: vehicle.id, body: changes }, { onSuccess: () => saved(`${name} updated`) })
    },
    onSubmitInvalid: () =>
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()),
  })

  // Fill the form fresh on every open, so an edit always starts from the latest saved vehicle.
  function changeOpen(next: boolean) {
    if (isSaving) return
    if (next) {
      form.reset(startValues(vehicle))
      save.reset()
    }
    setOpen(next)
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        {vehicle ? (
          <Button variant="ghost" size="icon" aria-label={`Edit ${vehicle.make} ${vehicle.model}`}>
            <Pencil />
          </Button>
        ) : (
          <Button>
            <Plus data-icon="inline-start" />
            Add Vehicle
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <form
          ref={formRef}
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>{vehicle ? 'Edit vehicle' : 'Add a vehicle'}</DialogTitle>
            <DialogDescription>{description(vehicle)}</DialogDescription>
          </DialogHeader>

          {save.isError && <FormAlert>{save.error.message}</FormAlert>}

          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="make">
              {(field) => (
                <LabeledField name={field.name} label="Make" errors={field.state.meta.errors}>
                  <Input
                    id={field.name}
                    placeholder="Maruti"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    disabled={isSaving}
                    aria-invalid={!field.state.meta.isValid}
                    autoFocus
                  />
                </LabeledField>
              )}
            </form.Field>

            <form.Field name="model">
              {(field) => (
                <LabeledField name={field.name} label="Model" errors={field.state.meta.errors}>
                  <Input
                    id={field.name}
                    placeholder="Swift"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    disabled={isSaving}
                    aria-invalid={!field.state.meta.isValid}
                  />
                </LabeledField>
              )}
            </form.Field>

            <form.Field name="colour">
              {(field) => (
                <LabeledField name={field.name} label="Colour" errors={field.state.meta.errors}>
                  <Input
                    id={field.name}
                    placeholder="White"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    disabled={isSaving}
                    aria-invalid={!field.state.meta.isValid}
                  />
                </LabeledField>
              )}
            </form.Field>

            <form.Field name="seatCapacity">
              {(field) => (
                <LabeledField name={field.name} label="Passenger seats" errors={field.state.meta.errors}>
                  <Select value={field.state.value} onValueChange={field.handleChange} disabled={isSaving}>
                    <SelectTrigger id={field.name} className="w-full" aria-invalid={!field.state.meta.isValid}>
                      <SelectValue placeholder="Choose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {SEAT_OPTIONS.map((seats) => (
                          <SelectItem key={seats} value={seats}>
                            {seats}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </LabeledField>
              )}
            </form.Field>
          </div>

          <form.Field name="plateNumber">
            {(field) => (
              <LabeledField name={field.name} label="Plate number" errors={field.state.meta.errors}>
                <Input
                  id={field.name}
                  placeholder="MH12AB1234"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  disabled={isSaving}
                  aria-invalid={!field.state.meta.isValid}
                />
              </LabeledField>
            )}
          </form.Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => changeOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 data-icon="inline-start" className="animate-spin" />}
              {vehicle ? 'Save changes' : 'Add vehicle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function startValues(vehicle: Vehicle | undefined): VehicleFormValues {
  if (!vehicle) return { make: '', model: '', colour: '', plateNumber: '', seatCapacity: '' }
  return {
    make: vehicle.make,
    model: vehicle.model,
    colour: vehicle.colour,
    plateNumber: vehicle.plateNumber,
    seatCapacity: String(vehicle.seatCapacity),
  }
}

function toBody(values: VehicleFormValues): CreateVehicleBody {
  return {
    make: values.make.trim(),
    model: values.model.trim(),
    colour: values.colour.trim(),
    plateNumber: values.plateNumber.trim(),
    seatCapacity: Number(values.seatCapacity),
  }
}

// Send only what changed: an untouched field could still send an APPROVED vehicle back for review.
function changedFields(vehicle: Vehicle, body: CreateVehicleBody): UpdateVehicleBody {
  const changes: UpdateVehicleBody = {}
  if (body.make !== vehicle.make) changes.make = body.make
  if (body.model !== vehicle.model) changes.model = body.model
  if (body.colour !== vehicle.colour) changes.colour = body.colour
  if (body.plateNumber !== vehicle.plateNumber) changes.plateNumber = body.plateNumber
  if (body.seatCapacity !== vehicle.seatCapacity) changes.seatCapacity = body.seatCapacity
  return changes
}

function description(vehicle: Vehicle | undefined): string {
  if (!vehicle) return 'It starts as pending. Upload the RC and licence next, then an admin reviews it.'
  if (vehicle.status === 'APPROVED') return 'Changing anything except the colour sends it back for review.'
  if (vehicle.status === 'REJECTED') return 'Saving sends it back for review.'
  return 'It is waiting for review.'
}
