import { useQuery } from '@tanstack/react-query'
import { listMyRides } from '../api/ridesApi'

export function useMyRides() {
  return useQuery({
    queryKey: ['driver', 'rides'],
    queryFn: ({ signal }) => listMyRides(signal),
  })
}
