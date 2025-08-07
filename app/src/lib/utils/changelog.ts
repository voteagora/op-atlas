import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function setCurrentUserForChangelog(userId: string) {
  try {
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
  } catch (e) {
    console.error(e)
  }
}

export async function clearCurrentUserForChangelog() {
  try {
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', '', true)`
  } catch (e) {
    console.error(e)
  }
}

export async function withChangelogTracking<T>(
  userId: string,
  operation: () => Promise<T>,
): Promise<T> {
  try {
    await setCurrentUserForChangelog(userId)
    return await operation()
  } finally {
    await clearCurrentUserForChangelog()
  }
}
