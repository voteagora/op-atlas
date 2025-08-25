/**
 * Low-level Safe Context Hook
 * Manages Safe wallet state and context switching
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { useSafeWallets } from "@/hooks/safe/useSafeWallets"
import type { SafeWallet } from "@/services/SafeService"
import { safeService } from "@/services/SafeService"
import type {
  FeatureFlag,
  SafeContextActions,
  SafeContextState,
  SignerWallet,
  WalletContext,
} from "@/types/safe"
import { FEATURE_AVAILABILITY } from "@/types/safe"

interface UseSafeContextProps {
  signerWallet: SignerWallet | null
  enabled?: boolean
}

const emptyWallets: SafeWallet[] = [] // This is to make sure we dont end up with unnecessary re-renders

export const useSafeContext = ({
  signerWallet,
  enabled = true,
}: UseSafeContextProps): SafeContextState & SafeContextActions => {
  // Use React Query for Safe wallets
  const signerAddress = useMemo(
    () => (enabled ? signerWallet?.address || null : null),
    [enabled, signerWallet?.address],
  )

  const {
    data: availableSafeWallets = emptyWallets,
    isLoading: isLoadingSafeWallets,
    error: queryError,
    refetch: refreshSafeWallets,
  } = useSafeWallets(signerAddress)

  const [state, setState] = useState<SafeContextState>({
    currentContext: "EOA" as WalletContext,
    signerWallet,
    availableSafeWallets: emptyWallets,
    selectedSafeWallet: null,
    isLoadingSafeWallets: false,
    error: null,
  })

  // Update state when React Query data changes
  useEffect(() => {
    setState((prev) => {
      return {
        ...prev,
        availableSafeWallets,
        isLoadingSafeWallets,
        signerWallet,
        error: queryError ? (queryError as Error).message : null,
      }
    })
  }, [availableSafeWallets, isLoadingSafeWallets, signerWallet, queryError])

  // Switch to Safe wallet context
  const switchToSafe = useCallback(
    async (safeAddress: string) => {
      // Try to find in the pre-fetched list first
      let targetSafe = state.availableSafeWallets.find(
        (safe) => safe.address.toLowerCase() === safeAddress.toLowerCase(),
      )

      // If not found (e.g., signer IS the Safe, so owner lookup returns empty), fetch info directly
      if (!targetSafe) {
        const info = await safeService.getSafeInfoByAddress(safeAddress)
        if (info) {
          targetSafe = info
        }
      }

      if (!targetSafe) {
        toast.error("Safe wallet not found")
        return
      }

      setState((prev) => ({
        ...prev,
        currentContext: "SAFE",
        selectedSafeWallet: targetSafe,
        error: null,
      }))

      toast.success(
        `Switched to Safe wallet: ${targetSafe.address.slice(
          0,
          6,
        )}...${targetSafe.address.slice(-4)}`,
      )
    },
    [state.availableSafeWallets],
  )

  // Switch back to EOA context
  const switchToEOA = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentContext: "EOA",
      // Clear selected Safe to avoid unintended Safe usage when returning to EOA
      selectedSafeWallet: null,
      error: null,
    }))
    if (signerWallet?.address) {
      const addr = signerWallet.address
      toast.success(
        `Switched to EOA wallet: ${addr.slice(0, 6)}...${addr.slice(-4)}`,
      )
    } else {
      toast.success("Switched to EOA wallet")
    }
    // Persist context for reloads
    // No persistence by design
  }, [signerWallet?.address])

  // No persisted rehydration by design

  // Check if a feature is enabled in current context
  const isFeatureEnabled = useCallback(
    (feature: FeatureFlag): boolean => {
      const availableFeatures = FEATURE_AVAILABILITY[state.currentContext]
      return availableFeatures.includes(feature)
    },
    [state.currentContext],
  )

  // Clear error state
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  // Wrap refetch to match expected signature
  const wrappedRefreshSafeWallets = useCallback(async () => {
    if (signerAddress) {
      await refreshSafeWallets()
    }
  }, [refreshSafeWallets, signerAddress])

  // Memoize the return value to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    return {
      ...state,
      refreshSafeWallets: wrappedRefreshSafeWallets,
      switchToSafe,
      switchToEOA,
      isFeatureEnabled,
      clearError,
    }
  }, [
    state,
    wrappedRefreshSafeWallets,
    switchToSafe,
    switchToEOA,
    isFeatureEnabled,
    clearError,
  ])

  return contextValue
}
