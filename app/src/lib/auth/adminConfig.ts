/**
 * Admin Configuration
 * Manages admin authorization and impersonation feature flags
 */

import { ADMIN_WALLETS } from './adminWallets'

const IMPERSONATION_ENABLED = process.env.ENABLE_ADMIN_IMPERSONATION === 'true'

/**
 * Check if admin impersonation feature is enabled
 * Requires both environment variable and at least one admin wallet
 */
export function isImpersonationEnabled(): boolean {
  return IMPERSONATION_ENABLED && ADMIN_WALLETS.length > 0
}

/**
 * Check if a wallet address is in the admin list
 * @param address - Ethereum wallet address (case-insensitive)
 */
export function isAdminWallet(address: string): boolean {
  if (!isImpersonationEnabled()) return false
  return ADMIN_WALLETS.includes(address.toLowerCase())
}

/**
 * Check if a user (by ID) has an admin wallet address
 * @param userId - User ID to check
 */
export async function isAdminUser(userId: string): Promise<boolean> {
  if (!isImpersonationEnabled()) return false

  const { prisma } = await import('@/db/client')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: true }
  })

  if (!user) return false

  // Check if any of the user's addresses are admin wallets
  return user.addresses.some(addr => isAdminWallet(addr.address))
}

/**
 * Get the list of admin wallet addresses
 * @returns Array of admin wallet addresses (lowercase)
 */
export function getAdminWallets(): string[] {
  return ADMIN_WALLETS
}

/**
 * Get detailed admin info for a user
 * Returns null if user is not found or not an admin
 */
export async function getAdminInfo(userId: string) {
  const { prisma } = await import('@/db/client')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: true }
  })

  if (!user) return null

  const adminAddress = user.addresses.find(addr => isAdminWallet(addr.address))

  if (!adminAddress) return null

  return {
    userId: user.id,
    name: user.name,
    username: user.username,
    adminAddress: adminAddress.address,
    isAdmin: true
  }
}

/**
 * Log admin action for audit trail
 */
export function logAdminAction(
  action: string,
  adminUserId: string,
  data: Record<string, any>
) {
  console.log(`🔐 ADMIN ACTION: ${action}`, {
    timestamp: new Date().toISOString(),
    adminUserId,
    ...data
  })

  // TODO: Store in database audit table if needed
}