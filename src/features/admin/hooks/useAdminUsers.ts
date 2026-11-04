import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listUsers } from '../api/adminApi'
import type { ListUsersParams } from '../types'

// One page of users for the admin table.
// The params are part of the key, so page 2 is cached separately from page 1.
export function useAdminUsers(params: ListUsersParams) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: ({ signal }) => listUsers(params, signal),
    // While the next page loads, keep showing the current one instead of an empty table.
    placeholderData: keepPreviousData,
  })
}
