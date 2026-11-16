// The server speaks "YYYY-MM-DD" (a day, no time). The calendar speaks Date objects.
// Both helpers use the browser's local day on purpose: toISOString() would convert to UTC
// and, in India, turn midnight on 2 Oct into "2026-10-01".

export function toDateText(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

// A moment → "2026-11-20T09:30" on the browser's clock, the format <input type="datetime-local"> and
// DateTimePicker use. new Date(text) reads it back.
export function toDateTimeText(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${toDateText(date)}T${hours}:${minutes}`
}

export function fromDateText(text: string): Date {
  const [year, month, day] = text.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// The calendar day in India, as "YYYY-MM-DD" (en-CA writes dates that way), so days compare as text.
const istDayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' })

// A moment's calendar day in India: "2026-11-19T18:30:00.000Z" → "2026-11-20".
export function toIstDayText(time: string | Date): string {
  return istDayFormat.format(new Date(time))
}

// The server's cancel rule (rides and bookings): allowed only before the departure day starts in India.
export function isBeforeDepartureDay(departureTime: string, now: Date): boolean {
  return toIstDayText(now) < toIstDayText(departureTime)
}

const dayLabelFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

// "2026-11-20" → "20 Nov 2026" (the browser's local day, like the helpers above).
export function formatDayText(text: string): string {
  return dayLabelFormat.format(fromDateText(text))
}
