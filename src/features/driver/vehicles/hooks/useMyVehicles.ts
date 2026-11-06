import { useQuery } from '@tanstack/react-query'
import { listMyVehicles } from '../api/vehiclesApi'

export function useMyVehicles() {
  return useQuery({
    queryKey: ['driver', 'vehicles'],
    queryFn: ({ signal }) => listMyVehicles(signal),
  })
}
