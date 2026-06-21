import { useQuery } from '@tanstack/react-query'

import { systemApi } from './api'

export function useSystemHealth(refetchInterval = 30_000) {
  return useQuery({
    queryKey: ['system', 'health'],
    queryFn: systemApi.health,
    refetchInterval,
    retry: false,
  })
}
