import type { PrismaClient } from "@prisma/client"

import { prisma } from "./client"

export async function getApiUser(
  { apiKey }: { apiKey: string },
  db: PrismaClient = prisma,
) {
  return db.apiUser.findFirst({
    where: {
      api_key: apiKey,
    },
  })
}
