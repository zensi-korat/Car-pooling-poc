// The server speaks "YYYY-MM-DD" (a day, no time). The calendar speaks Date objects.
// Both helpers use the browser's local day on purpose: toISOString() would convert to UTC
// and, in India, turn midnight on 2 Oct into "2026-10-01".

export function toDateText(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function fromDateText(text: string): Date {
  const [year, month, day] = text.split('-').map(Number)
  return new Date(year, month - 1, day)
}
