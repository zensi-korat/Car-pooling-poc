import { revalidateLogic, useForm } from '@tanstack/react-form'
import { CarFront, Loader2, Route } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { DateTimePicker } from '@/components/DateTimePicker'
import { FormAlert, LabeledField } from '@/components/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROUTES } from '@/constants/routes'
import { PlaceInput } from '@/features/shared/places/components/PlaceInput'
import type { Ride } from '@/features/shared/rides/api/rideSchema'
import type { Vehicle } from '@/features/shared/vehicles/api/vehicleSchema'
import { rideFormSchema, type RideFormValues } from '../api/ridesSchema'
import { useCreateRide } from '../hooks/useCreateRide'
import { useUpdateRide } from '../hooks/useUpdateRide'
import { toRideBody, toRideFormValues } from '../rides'

const EMPTY_RIDE: RideFormValues = {
  origin: null,
  destination: null,
  departureTime: '',
  estimatedCost: '',
  vehicleId: '',
}

// No ride → "Post" (empty form, POST). A ride → "Edit" (filled form, PATCH).
type RideFormProps = Readonly<{ vehicles: Vehicle[]; ride?: Ride }>

export function RideForm({ vehicles, ride }: RideFormProps) {
  const createRide = useCreateRide()
  const updateRide = useUpdateRide()
  const save = ride ? updateRide : createRide
  const navigate = useNavigate()

  function done(message: string) {
    toast.success(message)
    navigate(ROUTES.driver.rides)
  }

  const form = useForm({
    defaultValues: ride ? toRideFormValues(ride, vehicles) : EMPTY_RIDE,
    // Check everything on submit, then re-check each change while the driver fixes it.
    validationLogic: revalidateLogic(),
    validators: { onDynamic: rideFormSchema },
    onSubmit: ({ value }) => {
      const body = toRideBody(value)
      if (ride) updateRide.mutate({ id: ride.id, body }, { onSuccess: () => done('Ride updated') })
      else createRide.mutate(body, { onSuccess: () => done('Ride posted') })
    },
  })

  const isSaving = save.isPending

  return (
    <Card className="max-w-2xl">
      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        <CardContent>
          <FieldGroup>
            {save.isError && <FormAlert>{save.error.message}</FormAlert>}

            <div className="grid gap-5 sm:grid-cols-2">
              <form.Field name="origin">
                {(field) => (
                  <LabeledField name={field.name} label="From" errors={field.state.meta.errors}>
                    <PlaceInput
                      id={field.name}
                      value={field.state.value}
                      onChange={field.handleChange}
                      placeholder="Where does the ride start?"
                      aria-invalid={!field.state.meta.isValid}
                    />
                  </LabeledField>
                )}
              </form.Field>

              <form.Field name="destination">
                {(field) => (
                  <LabeledField name={field.name} label="To" errors={field.state.meta.errors}>
                    <PlaceInput
                      id={field.name}
                      value={field.state.value}
                      onChange={field.handleChange}
                      placeholder="Where does it end?"
                      aria-invalid={!field.state.meta.isValid}
                    />
                  </LabeledField>
                )}
              </form.Field>

              <form.Field name="departureTime">
                {(field) => (
                  <LabeledField name={field.name} label="Departure" errors={field.state.meta.errors}>
                    <DateTimePicker
                      id={field.name}
                      value={field.state.value}
                      onChange={field.handleChange}
                      disablePastDates
                      disabled={isSaving}
                      aria-invalid={!field.state.meta.isValid}
                    />
                  </LabeledField>
                )}
              </form.Field>

              <form.Field name="estimatedCost">
                {(field) => (
                  <LabeledField
                    name={field.name}
                    label="Total fare (₹)"
                    description="Split among the confirmed riders."
                    errors={field.state.meta.errors}
                  >
                    <Input
                      id={field.name}
                      inputMode="decimal"
                      placeholder="1200"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                      disabled={isSaving}
                      aria-invalid={!field.state.meta.isValid}
                    />
                  </LabeledField>
                )}
              </form.Field>
            </div>

            <form.Field name="vehicleId">
              {(field) => (
                <LabeledField
                  name={field.name}
                  label="Vehicle"
                  description="Its seats become the ride's seats."
                  errors={field.state.meta.errors}
                >
                  <Select value={field.state.value} onValueChange={field.handleChange} disabled={isSaving}>
                    <SelectTrigger id={field.name} className="w-full" aria-invalid={!field.state.meta.isValid}>
                      <SelectValue placeholder="Choose an approved vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.make} {vehicle.model} · {vehicle.plateNumber} · {vehicle.seatCapacity} seats
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </LabeledField>
              )}
            </form.Field>
          </FieldGroup>
        </CardContent>

        <CardFooter className="justify-end gap-2">
          <Button variant="outline" asChild>
            <Link to={ROUTES.driver.rides}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 data-icon="inline-start" className="animate-spin" />}
            {ride ? 'Save changes' : 'Post ride'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export function NoApprovedVehicle() {
  return (
    <Empty className="max-w-2xl border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CarFront />
        </EmptyMedia>
        <EmptyTitle>No approved vehicle yet</EmptyTitle>
        <EmptyDescription>
          A ride needs a vehicle an admin has approved. Its seats become the ride's seats.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link to={ROUTES.driver.vehicles}>Go to My Vehicles</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}

export function RideNotFound() {
  return (
    <Empty className="max-w-2xl border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Route />
        </EmptyMedia>
        <EmptyTitle>Ride not found</EmptyTitle>
        <EmptyDescription>It isn't one of your rides, or the link is wrong.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link to={ROUTES.driver.rides}>Back to My Rides</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
