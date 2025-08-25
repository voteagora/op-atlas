/**
 * Safe Context Provider
 * Wraps the application with Safe wallet context management
 */

"use client"

import { usePrivy } from "@privy-io/react-auth"
import { usePathname, useRouter } from "next/navigation"
import { createContext, ReactNode, useContext, useEffect, useMemo } from "react"
import { toast } from "sonner"
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

  // Global navigation guard for SAFE: block disallowed routes at click-time
  useEffect(() => {
    function onClickCapture(e: MouseEvent) {
      if (safeContextValue.currentContext !== "SAFE") return
      const target = e.target as HTMLElement
      const anchor = (target.closest &&
        target.closest("a")) as HTMLAnchorElement | null
      if (!anchor) return
      const href = anchor.getAttribute("href") || ""
      if (/^(https?:|mailto:|#)/.test(href)) return
      const SAFE_ALLOWED = ["/proposals", "/rounds"]
      const isAllowed = SAFE_ALLOWED.some((p) => href.startsWith(p))
      if (!isAllowed) {
        e.preventDefault()
        e.stopPropagation()
        toast.info("Switch to EOA to perform this action")
      }
    }
    document.addEventListener("click", onClickCapture, true)
    return () => document.removeEventListener("click", onClickCapture, true)
  }, [safeContextValue.currentContext])

  // Path-based guard if user already landed on a disallowed page while in SAFE
  const pathname = usePathname()
  const router = useRouter()
  useEffect(() => {
    if (safeContextValue.currentContext !== "SAFE") return
    const SAFE_ALLOWED = ["/proposals", "/rounds"]
    const isAllowed = SAFE_ALLOWED.some((p) => pathname?.startsWith(p))
    if (!isAllowed) {
      toast.info("Switch to EOA to perform this action")
      router.replace("/proposals")
    }
  }, [safeContextValue.currentContext, pathname, router])

  // Auto-refresh Safe wallets when signer changes
  // Using a stable dependency array to prevent unnecessary effect triggers
  useEffect(() => {
    const signerAddress = signerWallet?.address
    if (signerAddress) {
      safeContextValue.refreshSafeWallets()
    }
  }, [signerWallet?.address, safeContextValue.refreshSafeWallets])

  // Auto-switch to SAFE context when connected via Safe app
  useEffect(() => {
    const signerAddress = signerWallet?.address
    if (!signerAddress) return

    const ethereum: any =
      typeof window !== "undefined" ? (window as any).ethereum : undefined
    const isSafeEnv = !!(ethereum?.isSafe || ethereum?.isGnosisSafe)
    // If running inside the Safe app, switch immediately without API verification
    if (isSafeEnv && safeContextValue.currentContext !== "SAFE") {
      safeContextValue.switchToSafe(signerAddress)
      return
    }
    // Multisig-only via WalletConnect: if the signer IS a Safe and no Safe is selected yet, switch to SAFE
    const ensureSafeWhenSignerIsSafe = async () => {
      if (
        safeContextValue.currentContext === "SAFE" ||
        safeContextValue.selectedSafeWallet ||
        isSafeEnv
      )
        return
      try {
        const info = await safeService.getSafeInfoByAddress(signerAddress)
        if (info) {
          safeContextValue.switchToSafe(signerAddress)
        }
      } catch {}
    }
    ensureSafeWhenSignerIsSafe()
  }, [
    signerWallet?.address,
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
