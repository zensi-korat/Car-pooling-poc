import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Message, Room } from '../protocol'

// RTK Query: describe the endpoints, get hooks with loading / error / caching / refetch built in.
// (The same job TanStack Query does in Pool.)
export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (build) => ({
    getRooms: build.query<Room[], void>({ query: () => '/rooms' }),
    searchMessages: build.query<Message[], string>({ query: (q) => ({ url: '/search', params: { q } }) }),
  }),
})

export const { useGetRoomsQuery, useSearchMessagesQuery } = chatApi

// fetchBaseQuery's error is { status, data }: show the server's own message when it sent one.
export function errorMessage(error: unknown): string {
  const data = (error as { data?: { message?: string } } | undefined)?.data
  return data?.message ?? 'Something went wrong'
}
