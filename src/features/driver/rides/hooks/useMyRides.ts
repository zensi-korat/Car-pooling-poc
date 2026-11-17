import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { listMyRides } from '../api/ridesApi'

export function useMyRides() {
  return useQuery({
    queryKey: QUERY_KEYS.driver.rides,
    queryFn: ({ signal }) => listMyRides(signal),
  })
}
