/**
 * Database Routing Helpers
 * Helper functions to get the correct database client and user ID based on session context
 *
 * Usage Pattern:
 * ```typescript
 * import { auth } from "@/auth"
 * import { getSessionDatabase, getEffectiveUserId } from "@/lib/db/helpers"
 *
 * export async function getUserProjects() {
 *   const session = await auth()
 *   const db = getSessionDatabase(session)
 *   const userId = getEffectiveUserId(session)
 *
 *   return db.project.findMany({
 *     where: { team: { some: { userId } } }
 *   })
 * }
 * ```
 */

import { Session } from "next-auth"
import { PrismaClient } from "@prisma/client"

import adminDb from "@/db/adminClient"
import { prisma } from "@/db/client"
import {
  isSignedImpersonationSessionValid,
  type SignedImpersonationSession,
} from "@/lib/auth/impersonationSession"

export type SessionDatabaseOptions = {
  /**
   * Force production database usage even if session indicates impersonation.
   * Useful for cron jobs and background tasks that should never hit d-1.
   */
  forceProd?: boolean
}

/**
 * Get the appropriate database client based on session impersonation state
 *
 * @param session - NextAuth session object
 * @returns PrismaClient instance (either production or d-1)
 *
 * Routing Logic:
 * - If impersonating AND d-1 available → D-1 database
 * - Otherwise → Production database (default)
 */
export function getSessionDatabase(
  session: Session | null,
  options: SessionDatabaseOptions = {},
): PrismaClient {
  if (options.forceProd) {
    return prisma
  }

  const impersonation = hasValidImpersonationSession(session)
  if (impersonation) {
    if (adminDb.isD1Available()) {
      return adminDb.getClient(true) // Use d-1 database
    }
    // Hard-fail impersonation when D-1 is not configured to prevent writes to prod.
    throw new Error(
      "Admin impersonation requested but D-1 database is not configured. Set D1_DATABASE_URL or disable impersonation.",
    )
  }

  return prisma // Use production database (default)
}

/**
 * Get the effective user ID for queries
 *
 * @param session - NextAuth session object
 * @returns User ID to use for database queries (null if no session)
 *
 * Returns impersonated user ID if impersonating, otherwise session user ID
 */
export function getEffectiveUserId(session: Session | null): string | null {
  if (!session?.user?.id) return null

  const impersonation = hasValidImpersonationSession(session)
  if (impersonation) {
    return impersonation.targetUserId
  }

  return session.user.id
}

/**
 * Check if current session is in impersonation mode
 *
 * @param session - NextAuth session object
 * @returns true if admin is currently impersonating a user
 */
export function isImpersonating(session: Session | null): boolean {
  return !!hasValidImpersonationSession(session)
}

/**
 * Get impersonation context for logging/auditing
 *
 * @param session - NextAuth session object
 * @returns Impersonation context or null if not impersonating
 */
export function getImpersonationContext(session: Session | null) {
  const impersonation = hasValidImpersonationSession(session)
  if (!impersonation) {
    return null
  }

  return {
    adminUserId: impersonation.adminUserId,
    adminAddress: impersonation.adminAddress,
    targetUserId: impersonation.targetUserId,
    targetUserName: impersonation.targetUserName,
    startedAt: impersonation.startedAt,
    isActive: true,
  }
}

/**
 * Validate that session has required impersonation data
 * Throws error if impersonation is active but data is invalid
 */
export function validateImpersonationSession(session: Session | null): void {
  if (!session?.impersonation) {
    return
  }

  if (
    !isSignedImpersonationSessionValid(session.impersonation, {
      currentAdminUserId: session.user?.id,
    })
  ) {
    throw new Error("Invalid impersonation session: signature mismatch")
  }
}

function hasValidImpersonationSession(
  session: Session | null,
): SignedImpersonationSession | null {
  if (!session?.impersonation) {
    return null
  }

  const isValid = isSignedImpersonationSessionValid(
    session.impersonation,
    { currentAdminUserId: session.user?.id },
  )

  return isValid ? session.impersonation : null
}
