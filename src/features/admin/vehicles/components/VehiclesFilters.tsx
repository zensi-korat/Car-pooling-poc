import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { humanize } from '@/lib/text'
import { VEHICLE_STATUSES } from '../lib/filters'
import type { VehicleFilters } from '../api/vehiclesSchema'

type VehiclesFiltersProps = Readonly<{
  filters: VehicleFilters
  onChange: (changes: VehicleFilters) => void
}>

export function VehiclesFilters({ filters, onChange }: VehiclesFiltersProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="vehicles-status">Status</Label>
      <Select
        value={filters.status ?? 'PENDING'}
        onValueChange={(value) =>
          onChange({ status: VEHICLE_STATUSES.find((status) => status === value && status !== 'PENDING') })
        }
      >
        <SelectTrigger id="vehicles-status" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {VEHICLE_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {humanize(status)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
