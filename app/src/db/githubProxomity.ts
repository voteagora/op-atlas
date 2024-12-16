"use server"

import { prisma } from "./client"

export async function getGithubProximity(username: string | null) {
  if (!username) return null

  return prisma.githubProximity.findFirst({
    where: { peer: username },
  })
}
