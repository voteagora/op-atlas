/**
 * React Query hook for Safe wallet operations
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { safeService } from '@/services/SafeService'

export const useSafeWallets = (signerAddress: string | null) => {
  return useQuery({
    queryKey: ['safe-wallets', signerAddress],
    queryFn: () => {
      if (!signerAddress) {
        return Promise.resolve([])
      }
      return safeService.getSafeWalletsForSigner(signerAddress)
    },
    enabled: !!signerAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}