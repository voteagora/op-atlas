/**
 * Utilities for detecting different types of wallets
 */

import { ethers } from "ethers"

/**
 * Detects if the connected wallet is a smart contract wallet (Safe, Argent, etc.)
 * @param provider - The wallet provider
 * @param address - The wallet address
 * @returns Promise<boolean> - true if it's a smart contract wallet
 */
export async function isSmartContractWallet(
  provider: any,
  address: string,
): Promise<boolean> {
  try {
    // Method 1: Check if provider has smart contract wallet properties
    const ethereum = (window as any).ethereum
    
    // Check for Safe App provider
    if (ethereum?.isSafe || ethereum?.isGnosisSafe) {
      return true
    }

    // Method 2: Check if the address is a contract (smart contract wallets are contracts)
    const code = await provider.getCode(address)
    const isContract = code !== "0x"
    
    return isContract
  } catch (error) {
    // Silently fail - not all addresses are contracts and that's normal
    return false
  }
}

/**
 * Legacy function name for backward compatibility
 * @deprecated Use isSmartContractWallet instead
 */
export const isMultisigWallet = isSmartContractWallet 