import { useState, type SubmitEvent } from 'react'
import { Loader2, Pencil, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { FormAlert, FormField, TextField } from '@/components/form'
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Vehicle } from '@/features/shared/vehicles/api/vehicleSchema'
import { fieldErrors, isValid } from '@/lib/validation'
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

  const [open, setOpen] = useState(false)
  const [values, setValues] = useState(() => startValues(vehicle))
  const [submitted, setSubmitted] = useState(false)

  const errors = submitted ? fieldErrors(vehicleFormSchema, values) : {}
  const isSaving = save.isPending

  function update(field: keyof VehicleFormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  // Fill the form fresh on every open, so an edit always starts from the latest saved vehicle.
  function changeOpen(next: boolean) {
    if (isSaving) return
    if (next) {
      setValues(startValues(vehicle))
      setSubmitted(false)
      save.reset()
    }
    setOpen(next)
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (!isValid(fieldErrors(vehicleFormSchema, values))) return

    const body = toBody(values)
    const name = `${body.make} ${body.model}`

    if (!vehicle) {
      createVehicle.mutate(body, {
        onSuccess: () => {
          setOpen(false)
          toast.success(`${name} added`)
        },
      })
      return
    }

    const changes = changedFields(vehicle, body)
    if (Object.keys(changes).length === 0) {
      setOpen(false)
      return
    }
    updateVehicle.mutate(
      { id: vehicle.id, body: changes },
      {
        onSuccess: () => {
          setOpen(false)
          toast.success(`${name} updated`)
        },
      },
    )
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
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{vehicle ? 'Edit vehicle' : 'Add a vehicle'}</DialogTitle>
            <DialogDescription>{description(vehicle)}</DialogDescription>
          </DialogHeader>

          {save.isError && <FormAlert>{save.error.message}</FormAlert>}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Make"
              placeholder="Maruti"
              value={values.make}
              onChange={(e) => update('make', e.target.value)}
              error={errors.make}
              disabled={isSaving}
              autoFocus
            />
            <TextField
              label="Model"
              placeholder="Swift"
              value={values.model}
              onChange={(e) => update('model', e.target.value)}
              error={errors.model}
              disabled={isSaving}
            />
            <TextField
              label="Colour"
              placeholder="White"
              value={values.colour}
              onChange={(e) => update('colour', e.target.value)}
              error={errors.colour}
              disabled={isSaving}
            />
            <FormField
              id="vehicle-seats"
              errorId="vehicle-seats-error"
              label="Passenger seats"
              error={errors.seatCapacity}
            >
              <Select
                value={values.seatCapacity}
                onValueChange={(value) => update('seatCapacity', value)}
                disabled={isSaving}
              >
                <SelectTrigger
                  id="vehicle-seats"
                  className="w-full"
                  aria-invalid={!!errors.seatCapacity}
                  aria-describedby={errors.seatCapacity ? 'vehicle-seats-error' : undefined}
                >
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
            </FormField>
          </div>

          <TextField
            label="Plate number"
            placeholder="MH12AB1234"
            value={values.plateNumber}
            onChange={(e) => update('plateNumber', e.target.value)}
            error={errors.plateNumber}
            disabled={isSaving}
          />

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
