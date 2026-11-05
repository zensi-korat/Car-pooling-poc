// Shared helpers for reading list filters from the URL. Anything unexpected is ignored,
// so a hand-typed URL can't send the server a filter it would reject (400).
// Each feature has its own reader (features/<name>/lib/filters.ts) built from these.

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function hasFilters(filters: Record<string, unknown>): boolean {
  return Object.values(filters).some(Boolean)
}

// Raw text, spaces included, so the search box can show exactly what was typed.
// The page trims it before sending.
export function readSearch(params: URLSearchParams): string | undefined {
  return params.get('q')?.slice(0, 100) || undefined
}

// "to" before "from" is a 400 on the server: drop "to" instead.
export function readDateRange(from: string | null, to: string | null): [string | undefined, string | undefined] {
  const start = readDate(from)
  let end = readDate(to)
  if (start && end && end < start) end = undefined
  return [start, end]
}

function readDate(value: string | null): string | undefined {
  return value && DATE_PATTERN.test(value) ? value : undefined
}
