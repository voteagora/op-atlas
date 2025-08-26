/**
 * React Query hook for Safe wallet operations
 */

import { useQuery, useQueryClient } from "@tanstack/react-query"

import { safeService } from "@/services/SafeService"

export const useSafeWallets = (signerAddress: string | null) => {
  return useQuery({
    queryKey: ["safe-wallets", signerAddress],
    queryFn: async () => {
      if (!signerAddress) return []
      const safes = await safeService.getSafeWalletsForSigner(signerAddress)
      const signerLc = signerAddress.toLowerCase()
      // Defensive filter: only keep safes where the active EOA is an owner
      return safes.filter(
        (s) =>
          Array.isArray(s.owners) &&
          s.owners.some((o) => o.toLowerCase() === signerLc),
      )
    },
    enabled: !!signerAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Keep previously fetched safes while refetching to avoid dropdown flicker
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  })
}
