import { cache } from "react"

import { prisma } from "./client"

async function getApiUserFn({ apiKey }: { apiKey: string }) {
  return prisma.apiUser.findFirst({
    where: {
      api_key: apiKey,
    },
  })
}

export const getApiUser = cache(getApiUserFn)
