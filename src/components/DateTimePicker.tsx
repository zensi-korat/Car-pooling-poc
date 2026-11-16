import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatDayText, fromDateText, toDateText } from '@/lib/dates'
import { cn } from '@/lib/utils'

const DEFAULT_TIME = '09:00'

type DateTimePickerProps = Readonly<{
  id?: string
  value: string // "2026-11-20T09:30" (local time, like <input type="datetime-local">), or '' when empty
  onChange: (value: string) => void
  disablePastDates?: boolean
  disabled?: boolean
  'aria-invalid'?: boolean
}>

export function DateTimePicker({ id, value, onChange, disablePastDates, disabled, ...aria }: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const [today] = useState(() => new Date())
  const [date = '', time = ''] = value.split('T')

  function pickDate(day: Date | undefined) {
    if (!day) return
    onChange(`${toDateText(day)}T${time || DEFAULT_TIME}`)
    setOpen(false)
  }

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            className={cn('flex-1 justify-start font-normal', !date && 'text-muted-foreground')}
            {...aria}
          >
            <CalendarIcon data-icon="inline-start" />
            {date ? formatDayText(date) : 'Pick a date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date ? fromDateText(date) : undefined}
            defaultMonth={date ? fromDateText(date) : undefined}
            onSelect={pickDate}
            startMonth={disablePastDates ? today : undefined}
            disabled={disablePastDates ? { before: today } : undefined}
          />
        </PopoverContent>
      </Popover>

      {/* Time comes after the day: until a day is picked there's nothing to attach it to. */}
      <Input
        type="time"
        aria-label="Time"
        value={time}
        onChange={(event) => onChange(`${date}T${event.target.value}`)}
        disabled={disabled || !date}
        className="w-32"
        {...aria}
      />
    </div>
  )
}
