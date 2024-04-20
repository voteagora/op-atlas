"use server"

import { prisma } from "./client"

export async function getUserByFarcasterId(farcasterId: string) {
  return prisma.user.findUnique({
    where: {
      farcasterId,
    },
  })
}

export async function upsertUser({
  farcasterId,
  ...user
}: {
  farcasterId: string
  name?: string | null
  username?: string | null
  imageUrl?: string | null
  bio?: string | null
}) {
  return prisma.user.upsert({
    where: {
      farcasterId,
    },
    update: {
      ...user,
    },
    create: {
      farcasterId,
      ...user,
    },
  })
}
