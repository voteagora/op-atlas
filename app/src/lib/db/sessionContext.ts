"use server"

import { PrismaClient } from "@prisma/client"
import { Session } from "next-auth"

import { auth } from "@/auth"
import {
  getEffectiveUserId,
  getSessionDatabase,
  isImpersonating,
} from "@/lib/db/helpers"

export type SessionContext = {
  session: Session | null
  db: PrismaClient
  userId: string | null
  impersonating: boolean
}

export type SessionContextOptions = {
  /**
   * Throw if no authenticated (or impersonated) user ID is present.
   */
  requireUser?: boolean
  /**
   * Reuse an existing session (e.g., from API route) instead of calling auth() again.
   */
  session?: Session | null
  /**
   * Force the production database even if impersonation metadata exists.
   * Useful for cron jobs / background tasks.
   */
  forceProd?: boolean
}

/**
 * Get impersonation context for current request.
 * Use in Server Components, API routes, or when you need context in outer scope.
 *
 * @example
 * ```typescript
 * // Server Component
 * export default async function Page() {
 *   const { db, userId, impersonating } = await getImpersonationContext({ requireUser: true })
 *   const projects = await db.project.findMany({ where: { ownerId: userId } })
 *   return <div>{projects.length} projects</div>
 * }
 * ```
 */
export async function getImpersonationContext(
  options: SessionContextOptions = {}
): Promise<SessionContext> {
  const hasSessionOverride = Object.prototype.hasOwnProperty.call(
    options,
    "session",
  )
  const session = hasSessionOverride ? options.session ?? null : await auth()
  const db = getSessionDatabase(session, { forceProd: options.forceProd })
  const userId = getEffectiveUserId(session)

  if (options.requireUser && !userId) {
    throw new Error("Unauthorized")
  }

  return {
    session,
    db,
    userId,
    impersonating: isImpersonating(session),
  }
}

/**
 * Execute a handler with impersonation context.
 * Use in Server Actions or when logic is self-contained.
 *
 * @example
 * ```typescript
 * // Server Action
 * export async function createProject(name: string) {
 *   return withImpersonation(async ({ db, userId }) => {
 *     return db.project.create({ data: { name, ownerId: userId } })
 *   }, { requireUser: true })
 * }
 * ```
 */
export async function withImpersonation<T>(
  handler: (ctx: SessionContext) => Promise<T>,
  options: SessionContextOptions = {}
): Promise<T> {
  const ctx = await getImpersonationContext(options)
  return handler(ctx)
}
