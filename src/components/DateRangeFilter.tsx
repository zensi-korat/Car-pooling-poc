import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { fromDateText, toDateText } from '@/lib/dates'
import { cn } from '@/lib/utils'

export type DateTextRange = { from?: string; to?: string }

const labelFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

type DateRangeFilterProps = Readonly<{
  id?: string
  value: DateTextRange
  placeholder: string
  disableFutureDates?: boolean
  onChange: (range: DateTextRange) => void
}>

export function DateRangeFilter({ id, value, placeholder, disableFutureDates, onChange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange>()
  const [today] = useState(() => new Date())

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) setDraft(toRange(value))
    setOpen(nextOpen)
  }

  function apply(range: DateRange | undefined) {
    onChange({ from: range?.from && toDateText(range.from), to: range?.to && toDateText(range.to) })
    setOpen(false)
  }

  const label = describe(value)

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn('w-64 justify-start font-normal', !label && 'text-muted-foreground')}
        >
          <CalendarIcon data-icon="inline-start" />
          <span className="truncate">{label || placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={draft}
          onSelect={setDraft}
          resetOnSelect
          defaultMonth={draft?.from}
          endMonth={disableFutureDates ? today : undefined}
          disabled={disableFutureDates ? { after: today } : undefined}
        />
        <div className="flex justify-end gap-2 border-t p-3">
          <Button variant="ghost" size="sm" onClick={() => apply(undefined)}>
            Clear
          </Button>
          <Button size="sm" disabled={!draft?.from || !draft.to} onClick={() => apply(draft)}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function toRange({ from, to }: DateTextRange): DateRange | undefined {
  if (!from && !to) return undefined
  return { from: from ? fromDateText(from) : undefined, to: to ? fromDateText(to) : undefined }
}

function describe({ from, to }: DateTextRange): string {
  const show = (text: string) => labelFormat.format(fromDateText(text))
  if (from && to) return `${show(from)} – ${show(to)}`
  if (from) return `From ${show(from)}`
  if (to) return `Until ${show(to)}`
  return ''
}
