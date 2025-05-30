"use server"

import { Citizen } from "@prisma/client"

import { prisma } from "@/db/client"

export async function upsertCitizen({
  id,
  citizen,
}: {
  id: string
  citizen: {
    type?: string
    address?: string
    attestationId?: string
    timeCommitment?: string
  }
}) {
  return prisma.citizen.upsert({
    where: {
      userId: id,
    },
    update: {
      ...citizen,
    },
    create: {
      userId: id,
      ...citizen,
    },
  })
}

export async function getUserCitizen(id: string): Promise<Citizen | null> {
  return prisma.citizen.findUnique({
    where: {
      userId: id,
    },
  })
}
