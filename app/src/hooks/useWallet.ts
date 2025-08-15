/**
 * Unified Wallet Hook
 * Combines Privy, user data, and Safe context into a single interface
 */

"use client"

import { useSession } from "next-auth/react"
import { useCallback, useMemo } from "react"

import { useUser, useUserAddresses } from "@/hooks/db/useUser"
import { useEthersSigner } from "@/hooks/wagmi/useEthersSigner"
import { useSafeContextValue } from "@/providers/SafeContextProvider"
import type { UseWalletReturn } from "@/types/safe"

/**
 * Unified wallet hook that provides a single interface for all wallet operations
 * Automatically switches between EOA and Safe wallet contexts
 */
export const useWallet = (): UseWalletReturn => {
  // Get session data
  const { data: session } = useSession()

  // Get ethers signer
  const signer = useEthersSigner()

  // Get Safe context
  const safeContext = useSafeContextValue()

  // Extract values from safeContext to avoid re-renders when other properties change
  const {
    currentContext,
    selectedSafeWallet,
    signerWallet,
    availableSafeWallets,
    isLoadingSafeWallets,
    error,
  } = safeContext

  // Get user database data
  const { user } = useUser({
    id: session?.user?.id || "",
    enabled: !!session?.user,
  })

  const { user: userFromAddress } = useUserAddresses({
    address: selectedSafeWallet?.address || "",
    enabled: !!selectedSafeWallet,
  })

  // Compute current active address based on context
  const currentAddress = useMemo(() => {
    if (currentContext === "SAFE" && selectedSafeWallet) {
      return selectedSafeWallet.address
    }

    // Return signer wallet address (from Privy)
    return signerWallet?.address || null
  }, [currentContext, selectedSafeWallet, signerWallet?.address])

  // Memoize callback functions to prevent unnecessary re-renders
  const switchToSafe = useCallback(safeContext.switchToSafe, [
    safeContext.switchToSafe,
  ])
  const switchToEOA = useCallback(safeContext.switchToEOA, [
    safeContext.switchToEOA,
  ])
  const refreshSafeWallets = useCallback(safeContext.refreshSafeWallets, [
    safeContext.refreshSafeWallets,
  ])
  const isFeatureEnabled = useCallback(safeContext.isFeatureEnabled, [
    safeContext.isFeatureEnabled,
  ])

  const selectedUserData = useMemo(() => {
    if (currentContext === "SAFE" && selectedSafeWallet) {
      return userFromAddress
    }

    return user
  }, [currentContext, selectedSafeWallet, userFromAddress, user])

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      // Current active wallet (changes based on context)
      currentAddress,
      currentContext,
      signer,

      // Original EOA signer wallet
      signerWallet,

      // Safe wallet information
      selectedSafeWallet,
      availableSafeWallets,
      isLoadingSafeWallets,
      user: selectedUserData ?? null,
      // Context switching
      switchToSafe,
      switchToEOA,
      refreshSafeWallets,

      // Feature availability
      isFeatureEnabled,

      // Error handling
      error,
    }),
    [
      currentAddress,
      currentContext,
      signer,
      signerWallet,
      selectedSafeWallet,
      availableSafeWallets,
      isLoadingSafeWallets,
      selectedUserData,
      switchToSafe,
      switchToEOA,
      refreshSafeWallets,
      isFeatureEnabled,
      error,
    ],
  )
}
