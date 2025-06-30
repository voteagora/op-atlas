/**
 * Utilities for detecting different types of wallets
 */

import { BrowserProvider, ethers } from "ethers"

/**
 * Detects if the connected wallet is a Safe wallet
 * @param provider - The wallet provider (can be BrowserProvider or JsonRpcApiProvider)
 * @param address - The wallet address
 * @returns Promise<boolean> - true if it's a Safe wallet
 */
export async function isSafeWallet(
  provider: any,
  address: string,
): Promise<boolean> {
  try {
    // Method 1: Check if provider has Safe-specific properties
    const ethereum = (window as any).ethereum
    
    // Check for Safe App provider
    if (ethereum?.isSafe || ethereum?.isGnosisSafe) {
      return true
    }

    // Method 2: Check if the address is a contract (Safe wallets are smart contracts)
    const code = await provider.getCode(address)
    const isContract = code !== "0x"
    
    if (!isContract) {
      return false
    }

    // Method 3: Try to call Safe-specific methods (only if it's a contract)
    try {
      // Safe wallets typically have these methods
      const safeContract = new ethers.Contract(
        address,
        [
          "function getOwners() view returns (address[])",
          "function getThreshold() view returns (uint256)",
        ],
        provider,
      )

      // If we can call getOwners() successfully, it's likely a Safe
      const owners = await safeContract.getOwners()
      return Array.isArray(owners) && owners.length > 0
    } catch {
      // If Safe methods fail, it's likely not a Safe but could be another contract
      return false
    }
  } catch (error) {
    // Silently fail - not all addresses are contracts and that's normal
    return false
  }
}

/**
 * Checks if wallet supports EIP-1271 (Smart Contract Wallet signatures)
 * @param provider - The wallet provider
 * @param address - The wallet address
 * @returns Promise<boolean>
 */
export async function supportsEIP1271(
  provider: BrowserProvider,
  address: string,
): Promise<boolean> {
  try {
    const code = await provider.getCode(address)
    if (code === "0x") {
      return false // EOA doesn't support EIP-1271
    }

    // Check if contract implements EIP-1271
    const contract = new ethers.Contract(
      address,
      [
        "function isValidSignature(bytes32 _hash, bytes _signature) view returns (bytes4)",
      ],
      provider,
    )

    // Try to call the method to see if it exists
    try {
      // This will throw if method doesn't exist
      await contract.isValidSignature.staticCall(
        "0x" + "0".repeat(64),
        "0x",
      )
      return true
    } catch {
      return false
    }
  } catch {
    return false
  }
} 