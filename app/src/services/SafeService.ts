/**
 * Safe Service - Utility for Safe wallet operations
 * Handles detection of Safe wallets where current signer is an owner
 * Using Safe Protocol Kit v4
 */

import Safe from '@safe-global/protocol-kit'
import SafeApiKit from '@safe-global/api-kit'
import { ethers } from 'ethers'
import { useAccount } from 'wagmi'

export interface SafeWallet {
  address: string
  threshold: number
  owners: string[]
  nonce: number
  version: string
}

const SAFE_API_KEY = process.env.NEXT_PUBLIC_SAFE_API_KEY || process.env.SAFE_API_KEY

export interface SafeTransactionRequest {
  to: string
  data?: string
  value?: string
  operation?: 0 | 1 // 0 for CALL, 1 for DELEGATECALL
}

export class SafeService {
  private apiKit: SafeApiKit | null = null
    
  constructor() {
    this.apiKit = new SafeApiKit({
      chainId: BigInt(10), // Optimism chain ID
      apiKey: SAFE_API_KEY,
    })
  }

  /**
   * Get Safe info by address
   */
  async getSafeInfoByAddress(address: string): Promise<SafeWallet | null> {
    try {
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
      return null
    }
  }

  /**
   * Get Safe wallets where the provided address is an owner
   */
  async getSafeWalletsForSigner(signerAddress: string): Promise<SafeWallet[]> {
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
            version: safeInfo.version || '1.3.0',
          })
        } catch (error) {
          console.warn(`Failed to fetch info for Safe ${safeAddress}:`, error)
        }
      }

      return safeWallets
    } catch (error) {
      console.error('Error fetching Safe wallets:', error)
      return []
    }
  }

  /**
   * Initialize Safe SDK instance for a specific Safe wallet
   */
  async initializeSafe(
    safeAddress: string,
    signer: ethers.JsonRpcSigner,
    provider: any
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
      console.error('Error initializing Safe SDK:', error)
      return null
    }
  }

  /**
   * Create a Safe transaction proposal
   */
  async proposeTransaction(
    safe: Safe,
    senderAddress: string,
    transaction: SafeTransactionRequest
  ): Promise<string | null> {

    if (!this.apiKit) {
      throw new Error('Safe API kit not initialized')
    }

    const nextNonce = await this.apiKit?.getNextNonce(
      await safe.getAddress(),
    )

    try {
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
      await this.apiKit.proposeTransaction({
        safeAddress,
        safeTransactionData: signedTransaction.data,
        safeTxHash: safeTxHash,
        senderAddress,
        senderSignature: signedTransaction.encodedSignatures(),
      })

      return safeTxHash
    } catch (error) {
      console.error('Error proposing Safe transaction:', error)
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
      if (code === '0x') {
        return false
      }

      // Try to get Safe info to verify it's actually a Safe
      if (this.apiKit) {
        await this.apiKit.getSafeInfo(address)
        return true
      }

      return false
    } catch (error) {
      return false
    }
  }
}

// Export singleton instance
export const safeService = new SafeService()
export default SafeService
