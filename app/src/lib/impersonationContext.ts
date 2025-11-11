/**
 * Impersonation Context Detection
 * Provides helpers to detect if current request is in impersonation mode
 *
 * Usage:
 * ```typescript
 * if (await isInImpersonationMode()) {
 *   console.log('MOCKED: Email send')
 *   return { success: true, mocked: true }
 * }
 * // Real email sending
 * ```
 */

import { auth } from "@/auth"
import { cache } from "react"

/**
 * Get impersonation context for current request
 * Cached per-request for performance
 */
export const getImpersonationContext = cache(async () => {
  const session = await auth()

  return {
    isImpersonating: !!session?.impersonation?.isActive,
    adminUserId: session?.impersonation?.adminUserId,
    targetUserId: session?.impersonation?.targetUserId,
    session: session
  }
})

/**
 * Check if current request is in impersonation mode
 * Use this to gate external service calls
 */
export async function isInImpersonationMode(): Promise<boolean> {
  const context = await getImpersonationContext()
  return context.isImpersonating
}

/**
 * Wrapper for external service calls that should be mocked during impersonation
 *
 * @param serviceName - Name of the service (for logging)
 * @param operation - Description of the operation
 * @param realFn - The real function to call (only when NOT impersonating)
 * @param mockResponse - The mock response to return when impersonating
 */
export async function withImpersonationProtection<T>(
  serviceName: string,
  operation: string,
  realFn: () => Promise<T>,
  mockResponse: T
): Promise<T> {
  if (await isInImpersonationMode()) {
    console.log(`🎭 MOCKED [${serviceName}]: ${operation}`, {
      timestamp: new Date().toISOString(),
      mockResponse: typeof mockResponse === 'object'
        ? JSON.stringify(mockResponse).substring(0, 200)
        : mockResponse
    })
    return mockResponse
  }

  return realFn()
}
