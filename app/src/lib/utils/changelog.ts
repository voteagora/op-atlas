import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function withChangelogTracking<T>(
  userId: string | undefined,
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
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    if (userId) {
      try {
        await tx.$executeRaw`select set_config('app.current_user_id', ${userId}, true)`
      } catch {}
    }
    return run(tx as any)
  })
}
