/**
 * Safe Context Provider
 * Wraps the application with Safe wallet context management
 */

"use client"

import { usePrivy } from "@privy-io/react-auth"
import { createContext, ReactNode, useContext, useEffect, useMemo } from "react"
import { useAccount } from "wagmi"

import { useSafeContext } from "@/hooks/useSafeContext"
import { safeService } from "@/services/SafeService"
import type { SafeContextValue, SignerWallet } from "@/types/safe"

const SafeContext = createContext<SafeContextValue | null>(null)

export const useSafeContextValue = (): SafeContextValue => {
  const context = useContext(SafeContext)
  if (!context) {
    throw new Error(
      "useSafeContextValue must be used within SafeContextProvider",
    )
  }
  return context
}

interface SafeContextProviderProps {
  children: ReactNode
}

export const SafeContextProvider = ({ children }: SafeContextProviderProps) => {
  const { user: privyUser } = usePrivy()
  const { address, isConnected, chainId } = useAccount()

  // Use wagmi account info as primary source, fallback to Privy
  // Memoize the signer wallet to prevent unnecessary re-renders
  const signerWallet = useMemo<SignerWallet | null>(() => {
    if (isConnected && address) {
      return {
        address,
        chainId: chainId || 1,
      }
    } else if (
      privyUser?.linkedAccounts?.find(
        (account: any) => account.type === "wallet",
      )
    ) {
      return {
        address: (
          privyUser.linkedAccounts.find(
            (account: any) => account.type === "wallet",
          ) as any
        ).address,
        chainId: 1,
      }
    }
    return null
  }, [isConnected, address, chainId, privyUser?.linkedAccounts])

  // Initialize Safe context with current signer
  const safeContextValue = useSafeContext({
    signerWallet,
    enabled: !!signerWallet,
  })

  // Auto-refresh Safe wallets when signer changes
  // Using a stable dependency array to prevent unnecessary effect triggers
  useEffect(() => {
    const signerAddress = signerWallet?.address
    if (signerAddress) {
      safeContextValue.refreshSafeWallets()
    }
  }, [signerWallet?.address, safeContextValue.refreshSafeWallets])

  // Auto-switch to SAFE context when connected via Safe app or when signer address is a known Safe
  useEffect(() => {
    const signerAddress = signerWallet?.address
    if (!signerAddress) return

    const ethereum: any =
      typeof window !== "undefined" ? (window as any).ethereum : undefined
    const isSafeEnv = !!(ethereum?.isSafe || ethereum?.isGnosisSafe)
    const isSignerInList = safeContextValue.availableSafeWallets.some(
      (safe) => safe.address.toLowerCase() === signerAddress.toLowerCase(),
    )

    // If running inside the Safe app, switch immediately without API verification
    if (isSafeEnv && safeContextValue.currentContext !== "SAFE") {
      safeContextValue.switchToSafe(signerAddress)
      return
    }

    // Otherwise, switch when the signer shows up in the fetched Safe list
    if (
      isSignerInList &&
      safeContextValue.currentContext !== "SAFE" &&
      !safeContextValue.selectedSafeWallet
    ) {
      safeContextValue.switchToSafe(signerAddress)
    }
  }, [
    signerWallet?.address,
    safeContextValue.availableSafeWallets,
    safeContextValue.currentContext,
    safeContextValue.selectedSafeWallet,
    safeContextValue.switchToSafe,
  ])

  return (
    <SafeContext.Provider value={safeContextValue}>
      {children}
    </SafeContext.Provider>
  )
}
