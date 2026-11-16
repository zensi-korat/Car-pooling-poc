// Display formats shared by several lists. Always India time, whatever the browser's time zone.

const dateTimeFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'Asia/Kolkata',
})

const fareFormat = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  trailingZeroDisplay: 'stripIfInteger',
})

// "2026-11-12T04:00:00.000Z" → "12 Nov 2026, 9:30 am"
export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso))
}

// The server sends money as text ("1200.00") → "₹1,200"
export function formatFare(amount: string): string {
  return fareFormat.format(Number(amount))
}
