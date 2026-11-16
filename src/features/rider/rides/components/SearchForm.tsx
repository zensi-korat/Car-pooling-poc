import { revalidateLogic, useForm } from '@tanstack/react-form'
import { Loader2, Search } from 'lucide-react'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { LabeledField } from '@/components/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PlaceInput } from '@/features/shared/places/components/PlaceInput'
import { searchFormSchema, type SearchFormValues, type SearchRidesParams } from '../api/ridesSchema'
import { toSearchParams } from '../lib/search'

const EMPTY_SEARCH: SearchFormValues = { origin: null, destination: null, dates: {} }

type SearchFormProps = Readonly<{
  isSearching: boolean
  onSearch: (params: SearchRidesParams) => void
}>

export function SearchForm({ isSearching, onSearch }: SearchFormProps) {
  const form = useForm({
    defaultValues: EMPTY_SEARCH,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: searchFormSchema },
    onSubmit: ({ value }) => onSearch(toSearchParams(value)),
  })

  return (
    <Card>
      <CardContent>
        <form
          noValidate
          className="grid items-start gap-4 lg:grid-cols-[1fr_1fr_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Field name="origin">
            {(field) => (
              <LabeledField name={field.name} label="From" errors={field.state.meta.errors}>
                <PlaceInput
                  id={field.name}
                  value={field.state.value}
                  onChange={field.handleChange}
                  placeholder="Where do you start?"
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
                  placeholder="Where are you going?"
                  aria-invalid={!field.state.meta.isValid}
                />
              </LabeledField>
            )}
          </form.Field>

          <form.Field name="dates">
            {(field) => (
              <LabeledField name={field.name} label="When (optional)" errors={field.state.meta.errors}>
                <DateRangeFilter
                  id={field.name}
                  value={field.state.value}
                  onChange={field.handleChange}
                  placeholder="Any day"
                />
              </LabeledField>
            )}
          </form.Field>

          {/* lg:mt-5.5 lines the button up with the inputs, under the labels. */}
          <Button type="submit" disabled={isSearching} className="lg:mt-5.5">
            {isSearching ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Search data-icon="inline-start" />
            )}
            Search
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
