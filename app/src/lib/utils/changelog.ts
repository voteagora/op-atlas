import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

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
): Promise<T> {
  const session = await auth()
  const userId = session?.user?.id
  return prisma.$transaction(async (tx) => {
    if (userId) {
      try {
        await tx.$executeRaw`select set_config('app.current_user_id', ${userId}, true)`
      } catch {}
    }
    return run(tx as any)
  })
}
