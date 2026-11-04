// Shared by every paginated table: the allowed page sizes and safe readers for ?page= / ?pageSize=.

export const PAGE_SIZES = [25, 50, 100] as const
export const DEFAULT_PAGE_SIZE = 50

// "3" → 3. Missing, "abc", "0" or "-2" → 1.
export function readPage(value: string | null): number {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

// Only the sizes we offer; anything else (e.g. ?pageSize=9999) → the default.
export function readPageSize(value: string | null): number {
  const size = Number(value)
  return PAGE_SIZES.some((allowed) => allowed === size) ? size : DEFAULT_PAGE_SIZE
}
