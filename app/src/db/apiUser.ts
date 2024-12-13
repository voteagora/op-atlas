import { prisma } from "./client"

export async function getApiUser({ apiKey }: { apiKey: string }) {
  return prisma.apiUser.findFirst({
    where: {
      api_key: apiKey,
    },
  })
}
