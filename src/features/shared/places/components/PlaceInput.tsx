import { useState } from 'react'
import { TwoLines } from '@/components/page'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import type { Place } from '../api/placesSchema'
import { MIN_SEARCH_LENGTH, usePlaceSuggestions } from '../hooks/usePlaceSuggestions'

type PlaceInputProps = Readonly<{
  id?: string
  value: Place | null
  onChange: (place: Place | null) => void
  placeholder?: string
  'aria-invalid'?: boolean
}>

export function PlaceInput({ value, onChange, placeholder = 'Search a place', ...inputProps }: PlaceInputProps) {
  const [text, setText] = useState('')
  const { data: places = [], isFetching, isError, error } = usePlaceSuggestions(text)

  let emptyMessage = 'No places found.'
  if (text.trim().length < MIN_SEARCH_LENGTH) emptyMessage = `Type at least ${MIN_SEARCH_LENGTH} letters.`
  else if (isError) emptyMessage = error.message
  else if (isFetching) emptyMessage = 'Searching…'

  return (
    <Combobox
      items={places}
      value={value}
      onValueChange={onChange}
      // Picking a suggestion fills the input with its name: that's not a new search.
      onInputValueChange={(next, { reason }) => {
        if (reason !== 'item-press') setText(next)
      }}
      itemToStringLabel={(place: Place) => place.label}
      isItemEqualToValue={(place: Place, selected: Place) => place.id === selected.id}
      filter={null}
    >
      <ComboboxInput {...inputProps} placeholder={placeholder} showTrigger={false} showClear={value !== null} />
      <ComboboxContent>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(place: Place) => (
            <ComboboxItem key={place.id} value={place}>
              <TwoLines main={place.label} sub={place.address} />
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
