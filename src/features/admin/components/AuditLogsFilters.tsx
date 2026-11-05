import { X } from 'lucide-react'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { humanize } from '@/lib/text'
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES, hasFilters } from '../lib/filters'
import type { AuditLogFilters } from '../types'

const ALL = 'ALL'

type AuditLogsFiltersProps = Readonly<{
  filters: AuditLogFilters
  onChange: (changes: AuditLogFilters) => void
}>

export function AuditLogsFilters({ filters, onChange }: AuditLogsFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      {hasFilters(filters) && (
        <Button
          variant="outline"
          onClick={() => onChange({ entityType: undefined, action: undefined, from: undefined, to: undefined })}
        >
          <X data-icon="inline-start" />
          Clear filters
        </Button>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audit-entity">Entity</Label>
        <Select
          value={filters.entityType ?? ALL}
          onValueChange={(value) => onChange({ entityType: AUDIT_ENTITY_TYPES.find((type) => type === value) })}
        >
          <SelectTrigger id="audit-entity" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL}>All entities</SelectItem>
              {AUDIT_ENTITY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audit-action">Action</Label>
        <Select
          value={filters.action ?? ALL}
          onValueChange={(value) => onChange({ action: AUDIT_ACTIONS.find((action) => action === value) })}
        >
          <SelectTrigger id="audit-action" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL}>All actions</SelectItem>
              {AUDIT_ACTIONS.map((action) => (
                <SelectItem key={action} value={action}>
                  {humanize(action)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audit-date">Date</Label>
        <DateRangeFilter
          id="audit-date"
          placeholder="Any date"
          disableFutureDates
          value={{ from: filters.from, to: filters.to }}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
