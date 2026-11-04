// The TanStack Query cache: one for the whole app, shared through <QueryClientProvider>.

import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/services/api'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cached data counts as fresh for 30 s: showing the same list again doesn't refetch it.
      staleTime: 30_000,
      // Retry once, only when trying again could help: no connection (status 0) or a 5xx.
      // A 400/401/403/404 would get the same answer again.
      retry: (failureCount, error) =>
        failureCount < 1 && (!(error instanceof ApiError) || error.status === 0 || error.status >= 500),
    },
  },
})
