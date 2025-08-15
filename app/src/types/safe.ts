/**
 * Safe Wallet Integration Types
 */

import { JsonRpcSigner } from "ethers"

import { UserWithAddresses } from "@/lib/types"
import { SafeWallet } from "@/services/SafeService"

export type WalletContext = "EOA" | "SAFE"

export interface SignerWallet {
  address: string
  chainId: number
}

export interface SafeContextState {
  // Current context
  currentContext: WalletContext

  // EOA signer wallet (from Privy)
  signerWallet: SignerWallet | null

  // Available Safe wallets
  availableSafeWallets: SafeWallet[]

  // Currently selected Safe wallet
  selectedSafeWallet: SafeWallet | null

  // Loading states
  isLoadingSafeWallets: boolean

  // Error state
  error: string | null
}

export interface SafeContextActions {
  // Context switching
  switchToSafe: (safeAddress: string) => Promise<void>
  switchToEOA: () => void

  // Refresh Safe wallets
  refreshSafeWallets: () => Promise<void>

  // Feature availability
  isFeatureEnabled: (feature: FeatureFlag) => boolean

  // Clear error
  clearError: () => void
}

export type SafeContextValue = SafeContextState & SafeContextActions

// Feature flags for context-aware functionality
export type FeatureFlag = "PROFILE_EDITING" | "VOTING"

// Features available in each context
export const FEATURE_AVAILABILITY: Record<WalletContext, FeatureFlag[]> = {
  EOA: ["PROFILE_EDITING"],
  SAFE: [
    "VOTING", // Only voting through Safe transactions
  ],
}

// Unified wallet return type for useWallet hook
export interface UseWalletReturn {
  // Current active wallet info (changes based on context)
  currentAddress: string | null
  currentContext: WalletContext
  signer: JsonRpcSigner | undefined

  // Original EOA wallet from Privy
  signerWallet: SignerWallet | null

  // Safe wallet info
  selectedSafeWallet: SafeWallet | null
  availableSafeWallets: SafeWallet[]
  isLoadingSafeWallets: boolean

  // Context switching functions
  switchToSafe: (safeAddress: string) => Promise<void>
  switchToEOA: () => void
  refreshSafeWallets: () => Promise<void>

  // Feature availability
  isFeatureEnabled: (feature: FeatureFlag) => boolean
  user: UserWithAddresses | null

  // Error handling
  error: string | null
}

export interface SafeTransactionRequest {
  to: string
  data?: string
  value?: string
  operation?: 0 | 1 // 0 for CALL, 1 for DELEGATECALL
}
