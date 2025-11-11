"use server"

import { PrismaClient } from "@prisma/client"
import { Session } from "next-auth"

import { auth } from "@/auth"
import {
  DatabaseType,
  getDatabaseType,
  getEffectiveUserId,
  getSessionDatabase,
  isImpersonating,
} from "@/lib/db/helpers"

export type SessionDbContext = {
  session: Session | null
  db: PrismaClient
  userId: string | null
  impersonating: boolean
  databaseType: DatabaseType
}

export type WithSessionDbOptions = {
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

export async function withSessionDb<T>(
  handler: (ctx: SessionDbContext) => Promise<T>,
  options: WithSessionDbOptions = {}
): Promise<T> {
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

  return handler({
    session,
    db,
    userId,
    impersonating: isImpersonating(session),
    databaseType: getDatabaseType(session, { forceProd: options.forceProd }),
  })
}

export function withImpersonation(
  options?: WithSessionDbOptions,
): Promise<SessionDbContext>
export function withImpersonation<T>(
  handler: (ctx: SessionDbContext) => Promise<T>,
  options?: WithSessionDbOptions,
): Promise<T>
export async function withImpersonation<T>(
  handlerOrOptions?:
    | ((ctx: SessionDbContext) => Promise<T>)
    | WithSessionDbOptions,
  maybeOptions: WithSessionDbOptions = {},
): Promise<T | SessionDbContext> {
  if (typeof handlerOrOptions === "function") {
    return await withSessionDb(handlerOrOptions, maybeOptions)
  }

  const options = handlerOrOptions ?? {}
  return await withSessionDb(
    async (ctx) => ctx,
    options as WithSessionDbOptions,
  )
}
