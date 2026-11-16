import { useState, type ReactNode } from 'react'
import { FormAlert } from '@/components/form'
import { PageHeader } from '@/components/page'
import type { SearchRidesParams } from '@/features/rider/rides/api/ridesSchema'
import { SearchForm } from '@/features/rider/rides/components/SearchForm'
import { SearchResults, StartSearch } from '@/features/rider/rides/components/SearchResults'
import { useSearchRides } from '@/features/rider/rides/hooks/useSearchRides'

export function RiderSearchPage() {
  const [params, setParams] = useState<SearchRidesParams | null>(null)
  const { data, isError, error, isFetching, isPlaceholderData } = useSearchRides(params)

  let results: ReactNode = <StartSearch />
  if (isError) results = <FormAlert>{error.message}</FormAlert>
  else if (params) results = <SearchResults rides={isPlaceholderData ? undefined : data} />

  return (
    <>
      <PageHeader title="Find a ride" description="Upcoming rides on your route that still have a free seat." />
      <div className="flex flex-col gap-6 p-6">
        <SearchForm isSearching={isFetching} onSearch={setParams} />
        {results}
      </div>
    </>
  )
}
