import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { hasFilters, ROLES } from '../lib/userFilters'
import type { UserFilters } from '../types'

const ALL_ROLES = 'ALL'

type UsersFiltersProps = Readonly<{
  filters: UserFilters
  onChange: (changes: UserFilters) => void
}>

export function UsersFilters({ filters, onChange }: UsersFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
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
        <Label htmlFor="users-joined-from">Joined from</Label>
        <Input
          id="users-joined-from"
          type="date"
          max={filters.joinedTo}
          value={filters.joinedFrom ?? ''}
          onChange={(e) => onChange({ joinedFrom: e.target.value })}
          className="w-40"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="users-joined-to">Joined to</Label>
        <Input
          id="users-joined-to"
          type="date"
          min={filters.joinedFrom}
          value={filters.joinedTo ?? ''}
          onChange={(e) => onChange({ joinedTo: e.target.value })}
          className="w-40"
        />
      </div>

      {hasFilters(filters) && (
        <Button
          variant="ghost"
          onClick={() => onChange({ q: undefined, role: undefined, joinedFrom: undefined, joinedTo: undefined })}
        >
          <X data-icon="inline-start" />
          Clear filters
        </Button>
      )}
    </div>
  )
}
