import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { listMyVehicles } from '../api/vehiclesApi'

export function useMyVehicles() {
  return useQuery({
    queryKey: QUERY_KEYS.driver.vehicles,
    queryFn: ({ signal }) => listMyVehicles(signal),
  })
}
