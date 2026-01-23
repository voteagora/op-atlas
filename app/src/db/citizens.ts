"use server"

import type { Citizen, PrismaClient } from "@prisma/client"

import { prisma } from "./client"
import { CITIZEN_TYPES } from "@/lib/constants"
import { CitizenLookup } from "@/lib/types"

export async function upsertCitizen({
  id,
  citizen,
}: {
  id: string
  citizen: {
    type: string
    address: string
    attestationId?: string
    timeCommitment?: string
    projectId?: string | null
    organizationId?: string | null
  }
}, db: PrismaClient = prisma) {
  return db.citizen.upsert({
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

export async function updateCitizen({
  id,
  citizen,
}: {
  id: string
  citizen: {
    type?: string
    address?: string
    attestationId?: string
    timeCommitment?: string
    projectId?: string | null
    organizationId?: string | null
  }
}, db: PrismaClient = prisma) {
  return db.citizen.update({
    where: {
      userId: id,
    },
    data: citizen,
  })
}

export async function getCitizenForUser(
  userId: string,
  db: PrismaClient = prisma,
): Promise<Citizen | null> {
  return db.citizen.findUnique({
    where: { userId },
  })
}

export async function getCitizenByType(
  lookup: CitizenLookup,
  db: PrismaClient = prisma,
): Promise<Citizen | null> {
  switch (lookup.type) {
    case CITIZEN_TYPES.user:
      return db.citizen.findUnique({
        where: { userId: lookup.id },
      })
    case CITIZEN_TYPES.chain:
      return db.citizen.findFirst({
        where: { organizationId: lookup.id },
      })
    case CITIZEN_TYPES.app:
      return db.citizen.findFirst({
        where: { projectId: lookup.id },
      })
  }
}

export async function getCitizenCountByType(
  type: string,
  db: PrismaClient = prisma,
): Promise<number> {
  return db.citizen.count({
    where: {
      type,
      attestationId: {
        not: null,
      },
    },
  })
}

export async function getCitizenById(
  id: number,
  db: PrismaClient = prisma,
): Promise<Citizen | null> {
  return db.citizen.findUnique({
    where: { id },
  })
}

export async function getCitizenProposalVote(
  citizenId: number,
  proposalId: string,
  db: PrismaClient = prisma,
): Promise<any> {
  return db.offChainVote.findFirst({
    where: {
      citizenId: citizenId,
      proposalId: proposalId,
    },
  })
}

export async function deleteCitizen(
  id: number,
  db: PrismaClient = prisma,
) {
  return db.citizen.delete({
    where: { id },
  })
}

export async function getCitizenByAddress(
  address: string,
  db: PrismaClient = prisma,
): Promise<Citizen | null> {
  return db.citizen.findFirst({
    where: {
      address: {
        equals: address,
        mode: "insensitive",
      },
    },
  })
}
