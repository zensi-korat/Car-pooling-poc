import { Search, X } from 'lucide-react'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { hasFilters } from '@/lib/filters'
import { ROLES } from '../lib/filters'
import type { UserFilters } from '../api/usersSchema'

const ALL_ROLES = 'ALL'

type UsersFiltersProps = Readonly<{
  filters: UserFilters
  onChange: (changes: UserFilters) => void
}>

export function UsersFilters({ filters, onChange }: UsersFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      {hasFilters(filters) && (
        <Button
          variant="outline"
          onClick={() => onChange({ q: undefined, role: undefined, joinedFrom: undefined, joinedTo: undefined })}
        >
          <X data-icon="inline-start" />
          Clear filters
        </Button>
      )}
      <div className="flex min-w-60 flex-1 flex-col gap-1.5">
        <Label htmlFor="users-search">Search</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="users-search"
            type="search"
            placeholder="Name, email or phone"
            maxLength={100}
            value={filters.q ?? ''}
            onChange={(e) => onChange({ q: e.target.value })}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="users-role">Role</Label>
        <Select
          value={filters.role ?? ALL_ROLES}
          onValueChange={(value) => onChange({ role: ROLES.find((role) => role === value) })}
        >
          <SelectTrigger id="users-role" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL_ROLES}>All roles</SelectItem>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="users-joined">Joined</Label>
        <DateRangeFilter
          id="users-joined"
          placeholder="Any date"
          disableFutureDates
          value={{ from: filters.joinedFrom, to: filters.joinedTo }}
          onChange={({ from, to }) => onChange({ joinedFrom: from, joinedTo: to })}
        />
      </div>
    </div>
  )
}
