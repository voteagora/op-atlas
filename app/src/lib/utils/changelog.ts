import { prisma as defaultPrisma } from "../../db/client"
import { Prisma, PrismaClient } from "@prisma/client"
import { Session } from "next-auth"
import { withImpersonation } from "@/lib/db/sessionContext"

type TransactionOptions = {
  maxWait?: number
  timeout?: number
  isolationLevel?: Prisma.TransactionIsolationLevel
}

type ChangelogContext = {
  db?: PrismaClient
  session?: Session | null
}

export async function withChangelogTracking<T>(
  run: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: TransactionOptions,
  context: ChangelogContext = {},
): Promise<T> {
  const client = context.db ?? defaultPrisma
  const { session, userId } = await withImpersonation({
    session: context.session,
  })
  const runWithTracking = async (tx: Prisma.TransactionClient) => {
    if (userId) {
      try {
        await tx.$executeRaw`select set_config('app.current_user_id', ${userId}, true)`
      } catch {}
    }
    return run(tx as any)
  }

  if (options) {
    return client.$transaction(runWithTracking, options)
  }

  return client.$transaction(runWithTracking)
}
