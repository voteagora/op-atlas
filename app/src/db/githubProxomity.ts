"use server"

import type { PrismaClient } from "@prisma/client"

import { prisma } from "./client"

export async function getGithubProximity(
  username: string | null,
  db: PrismaClient = prisma,
) {
  if (!username) return null

  return db.githubProximity.findFirst({
    where: { peer: username },
  })
}
