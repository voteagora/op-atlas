import { cache } from "react"

import { prisma } from "./client"

async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      addresses: {
        orderBy: {
          primary: "desc",
        },
      },
      interaction: true,
      emails: true,
    },
  })
}

export const getUserByIdCached = cache(getUserById)
