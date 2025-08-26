/**
 * Safe Service - Utility for Safe wallet operations
 * Handles detection of Safe wallets where current signer is an owner
 * Using Safe Protocol Kit v4
 */

import SafeApiKit from "@safe-global/api-kit"
import Safe from "@safe-global/protocol-kit"
import { ethers } from "ethers"

export interface SafeWallet {
  address: string
  threshold: number
  owners: string[]
  nonce: number
  version: string
}

const SAFE_API_KEY = process.env.NEXT_PUBLIC_SAFE_API_KEY

export interface SafeTransactionRequest {
  to: string
  data?: string
  value?: string
  operation?: 0 | 1 // 0 for CALL, 1 for DELEGATECALL
}

export class SafeService {
  private apiKit: SafeApiKit | null = null
  private txServiceUrl: string | null = null

  private ensureApiKit(): void {
    if (this.apiKit) return
    try {
      const isDev = process.env.NEXT_PUBLIC_ENV === "dev"
      // Dev aligns to Sepolia L1 (EAS on Sepolia L1), Prod to OP Mainnet
      const chainId = isDev ? BigInt(11155111) : BigInt(10)
      const txServiceUrlRoot = isDev
        ? "https://safe-transaction-sepolia.safe.global"
        : "https://safe-transaction-optimism.safe.global"
      const txServiceUrl = isDev ? `${txServiceUrlRoot}/api` : txServiceUrlRoot
      // Always set txServiceUrl for REST fallback, even without API key
      this.txServiceUrl = txServiceUrl
      // Initialize SDK only when API key is available
      if (SAFE_API_KEY) {
        this.apiKit = new SafeApiKit({
          chainId,
          apiKey: SAFE_API_KEY,
          txServiceUrl,
        } as any)
      } else {
        this.apiKit = null
      }
    } catch (_e) {
      this.apiKit = null
      this.txServiceUrl = null
    }
  }
  constructor() {
    // Lazy init to avoid crashes when the key isn't available in client bundles/SSR
    this.ensureApiKit()
  }

  /**
   * Get Safe info by address
   */
  async getSafeInfoByAddress(address: string): Promise<SafeWallet | null> {
    try {
      this.ensureApiKit()
      if (!this.apiKit) return null
      const info = await this.apiKit.getSafeInfo(address)
      return {
        address,
        threshold: Number(info.threshold),
        owners: info.owners,
        nonce: Number(info.nonce),
        version: info.version || "1.3.0",
      }
    } catch (_e) {
      // Fallback REST for 404s
      try {
        const baseApi = this.txServiceUrl
          ? this.txServiceUrl.endsWith("/api")
            ? this.txServiceUrl
            : `${this.txServiceUrl}/api`
          : null
        if (!baseApi) return null
        const res = await fetch(`${baseApi}/v1/safes/${address}`)
        if (!res.ok) return null
        const info: any = await res.json()
        return {
          address,
          threshold: Number(info.threshold ?? 0),
          owners: info.owners ?? [],
          nonce: Number(info.nonce ?? 0),
          version: info.version || "1.3.0",
        }
      } catch {
        return null
      }
    }
  }

  /**
   * Get Safe wallets where the provided address is an owner
   */
  async getSafeWalletsForSigner(signerAddress: string): Promise<SafeWallet[]> {
    this.ensureApiKit()
    if (!this.apiKit || !signerAddress) {
      return []
    }

    try {
      // Get all Safe wallets owned by the signer
      const safesByOwner = await this.apiKit.getSafesByOwner(signerAddress)

      const safeWallets: SafeWallet[] = []

      for (const safeAddress of safesByOwner.safes) {
        try {
          const safeInfo = await this.apiKit.getSafeInfo(safeAddress)

          safeWallets.push({
            address: safeAddress,
            threshold: Number(safeInfo.threshold),
            owners: safeInfo.owners,
            nonce: Number(safeInfo.nonce),
            version: safeInfo.version || "1.3.0",
          })
        } catch (error) {
          console.warn(`Failed to fetch info for Safe ${safeAddress}:`, error)
        }
      }

      return safeWallets
    } catch (error) {
      console.error("Error fetching Safe wallets via SDK:", error)
      // Fallback: fetch directly from Transaction Service
      try {
        if (!this.txServiceUrl) return []
        const baseApi = this.txServiceUrl.endsWith("/api")
          ? this.txServiceUrl
          : `${this.txServiceUrl}/api`
        const ownerUrl = `${baseApi}/v1/owners/${signerAddress}/safes`
        const ownerRes = await fetch(ownerUrl)
        if (!ownerRes.ok) {
          console.error(
            "Owner safes fetch failed:",
            ownerRes.status,
            ownerRes.statusText,
          )
          return []
        }
        const ownerJson: any = await ownerRes.json()
        const safes: string[] = ownerJson?.safes || []
        const results: SafeWallet[] = []
        for (const safeAddress of safes) {
          try {
            const infoRes = await fetch(`${baseApi}/v1/safes/${safeAddress}`)
            if (!infoRes.ok) continue
            const info = await infoRes.json()
            results.push({
              address: safeAddress,
              threshold: Number(info.threshold ?? 0),
              owners: info.owners ?? [],
              nonce: Number(info.nonce ?? 0),
              version: info.version || "1.3.0",
            })
          } catch (_) {}
        }
        return results
      } catch (fallbackError) {
        console.error("Fallback fetch Safe wallets failed:", fallbackError)
        return []
      }
    }
  }

  /**
   * Initialize Safe SDK instance for a specific Safe wallet
   */
  async initializeSafe(
    safeAddress: string,
    signer: ethers.JsonRpcSigner,
    provider: any,
  ): Promise<Safe | null> {
    try {
      // Get the provider from the signer

      const signerAddress = await signer.getAddress()

      // Initialize Safe SDK with provider and signer address
      const safeSdk = await Safe.init({
        provider,
        safeAddress,
        signer: signerAddress,
      })

      // Connect to the Safe with signer
      await safeSdk.connect({
        signer: signerAddress,
        safeAddress,
      })

      return safeSdk
    } catch (error) {
      console.error("Error initializing Safe SDK:", error)
      return null
    }
  }

  /**
   * Create a Safe transaction proposal
   */
  async proposeTransaction(
    safe: Safe,
    senderAddress: string,
    transaction: SafeTransactionRequest,
  ): Promise<string | null> {
    this.ensureApiKit()
    if (!this.apiKit) {
      throw new Error("Safe API kit not initialized")
    }

    // Prefer on-chain nonce to avoid stale service state after deleting queued txs
    const nextNonce = await safe.getNonce()

    // Try to pre-estimate safeTxGas via Transaction Service to avoid GS013 due to 0 gas
    const attemptPropose = async () => {
      // Create the transaction
      const safeTransaction = await safe.createTransaction({
        transactions: [
          {
            to: transaction.to,
            data: transaction.data || "0x",
            value: transaction.value || "0",
            operation: transaction.operation || 0,
          },
        ],
        onlyCalls: true,
        options: {
          nonce: Number(nextNonce),
        },
      })

      // Sign the transaction
      const signedTransaction = await safe.signTransaction(safeTransaction)

      const safeTxHash = await safe.getTransactionHash(safeTransaction)
      // Get the Safe address
      const safeAddress = await safe.getAddress()

      // Propose the transaction to the Safe service
      await this.apiKit!.proposeTransaction({
        safeAddress,
        safeTransactionData: signedTransaction.data,
        safeTxHash: safeTxHash,
        senderAddress,
        senderSignature: signedTransaction.encodedSignatures(),
      })

      return safeTxHash
    }

    try {
      return await attemptPropose()
    } catch (error) {
      console.error("Error proposing Safe transaction:", error)
      return null
    }
  }

  /**
   * Check if an address is a Safe wallet
   */
  async isSafeWallet(address: string, provider: any): Promise<boolean> {
    try {
      // Check if the address has code (is a contract)
      const code = await provider.getCode(address)
      if (code === "0x") return false

      // Best-effort verification via API if available; otherwise consider contract as Safe for UI purposes
      this.ensureApiKit()
      if (this.apiKit) {
        try {
          await this.apiKit.getSafeInfo(address)
          return true
        } catch {
          // ignore and fallback to contract heuristics
        }
      }
      return true
    } catch (error) {
      return false
    }
  }
}

// Export singleton instance
export const safeService = new SafeService()
export default SafeService
