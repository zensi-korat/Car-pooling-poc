import { Search, X } from 'lucide-react'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { hasFilters, RIDE_STATUSES } from '../lib/filters'
import type { RideFilters } from '../types'

const ALL_STATUSES = 'ALL'

type RidesFiltersProps = Readonly<{
  filters: RideFilters
  onChange: (changes: RideFilters) => void
}>

export function RidesFilters({ filters, onChange }: RidesFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      {hasFilters(filters) && (
        <Button
          variant="outline"
          onClick={() =>
            onChange({ q: undefined, status: undefined, departureFrom: undefined, departureTo: undefined })
          }
        >
          <X data-icon="inline-start" />
          Clear filters
        </Button>
      )}

      <div className="flex min-w-60 flex-1 flex-col gap-1.5">
        <Label htmlFor="rides-search">Search</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="rides-search"
            type="search"
            placeholder="Place, driver name or email"
            maxLength={100}
            value={filters.q ?? ''}
            onChange={(e) => onChange({ q: e.target.value })}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rides-status">Status</Label>
        <Select
          value={filters.status ?? ALL_STATUSES}
          onValueChange={(value) => onChange({ status: RIDE_STATUSES.find((status) => status === value) })}
        >
          <SelectTrigger id="rides-status" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
              {RIDE_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rides-departure">Departure</Label>
        <DateRangeFilter
          id="rides-departure"
          placeholder="Any date"
          value={{ from: filters.departureFrom, to: filters.departureTo }}
          onChange={({ from, to }) => onChange({ departureFrom: from, departureTo: to })}
        />
      </div>
    </div>
  )
}
