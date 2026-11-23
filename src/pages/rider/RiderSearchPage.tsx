import { useState } from 'react'
import { FormAlert } from '@/components/form'
import { PageHeader } from '@/components/page'
import type { SearchRidesParams } from '@/features/rider/rides/api/ridesSchema'
import { RidesMap } from '@/features/rider/rides/components/RidesMap'
import { SearchForm } from '@/features/rider/rides/components/SearchForm'
import { SearchResults, StartSearch } from '@/features/rider/rides/components/SearchResults'
import { useSearchRides } from '@/features/rider/rides/hooks/useSearchRides'

export function RiderSearchPage() {
  const [params, setParams] = useState<SearchRidesParams | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data, isError, error, isFetching, isPlaceholderData } = useSearchRides(params)
  const selectedRide = data?.find((ride) => ride.id === selectedId)
  const toggleSelected = (id: string) => setSelectedId((current) => (current === id ? null : id))

  const results = isError ? (
    <FormAlert>{error.message}</FormAlert>
  ) : (
    <SearchResults rides={isPlaceholderData ? undefined : data} selectedId={selectedId} onSelect={toggleSelected} />
  )

  return (
    <>
      <PageHeader title="Find a ride" description="Upcoming rides on your route that still have a free seat." />
      <div className="flex flex-col gap-6 p-6">
        <SearchForm isSearching={isFetching} onSearch={setParams} />
        {params ? (
          <div className="grid items-start gap-6 lg:grid-cols-2">
            {results}
            <RidesMap rides={data ?? []} selectedRide={selectedRide} onSelect={toggleSelected} />
          </div>
        ) : (
          <StartSearch />
        )}
      </div>
    </>
  )
}
