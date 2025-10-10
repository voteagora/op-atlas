import { auth } from "@/auth"
import { Prisma, PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

type TransactionOptions = {
  maxWait?: number
  timeout?: number
  isolationLevel?: Prisma.TransactionIsolationLevel
}

export async function withChangelogTracking<T>(
  run: (
    tx: Omit<
      PrismaClient,
      | "$connect"
      | "$disconnect"
      | "$use"
      | "$on"
      | "$extends"
      | "$transaction"
      | "$runCommandRaw"
      | "$queryRaw"
      | "$queryRawUnsafe"
      | "$executeRawUnsafe"
    > & { $executeRaw: typeof prisma.$executeRaw },
  ) => Promise<T>,
  options?: TransactionOptions,
): Promise<T> {
  const session = await auth()
  const userId = session?.user?.id
  const runWithTracking = async (tx: Prisma.TransactionClient) => {
    if (userId) {
      try {
        await tx.$executeRaw`select set_config('app.current_user_id', ${userId}, true)`
      } catch {}
    }
    return run(tx as any)
  }

  if (options) {
    return prisma.$transaction(runWithTracking, options)
  }

  return prisma.$transaction(runWithTracking)
}
