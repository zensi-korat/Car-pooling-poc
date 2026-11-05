import { useSearchParams } from 'react-router'
import { DEFAULT_PAGE_SIZE, readPage, readPageSize } from '@/lib/pagination'

type Changes = Record<string, string | undefined>

// The URL state of a paginated, filterable list: ?page=2&pageSize=25&role=RIDER…
// `readFilters` is the page's own safe reader (readUserFilters, readRideFilters…).
export function useListParams<F extends Changes>(readFilters: (params: URLSearchParams) => F) {
  const [searchParams, setSearchParams] = useSearchParams()

  // Empty values and defaults are removed, so the URL stays short.
  // `replace` swaps the current history entry instead of adding one (used while typing).
  function updateUrl(changes: Changes, replace = false) {
    setSearchParams(
      (params) => {
        for (const [key, value] of Object.entries(changes)) {
          if (value) params.set(key, value)
          else params.delete(key)
        }
        return params
      },
      { replace },
    )
  }

  return {
    page: readPage(searchParams.get('page')),
    pageSize: readPageSize(searchParams.get('pageSize')),
    filters: readFilters(searchParams),
    setPage: (page: number) => updateUrl({ page: page > 1 ? String(page) : undefined }),
    setPageSize: (size: number) =>
      updateUrl({ page: undefined, pageSize: size === DEFAULT_PAGE_SIZE ? undefined : String(size) }),
    // Any filter change goes back to page 1; typing in search doesn't fill the Back history.
    setFilters: (changes: F) => updateUrl({ ...changes, page: undefined }, 'q' in changes),
  }
}
