"use server"

import { Citizen } from "@prisma/client"

import { prisma } from "@/db/client"
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
}) {
  return prisma.citizen.update({
    where: {
      userId: id,
    },
    data: citizen,
  })
}

export async function getCitizenForUser(
  userId: string,
): Promise<Citizen | null> {
  return prisma.citizen.findUnique({
    where: { userId },
  })
}

export async function getCitizenByType(
  lookup: CitizenLookup,
): Promise<Citizen | null> {
  switch (lookup.type) {
    case CITIZEN_TYPES.user:
      return prisma.citizen.findUnique({
        where: { userId: lookup.id },
      })
    case CITIZEN_TYPES.chain:
      return prisma.citizen.findFirst({
        where: { organizationId: lookup.id },
      })
    case CITIZEN_TYPES.app:
      return prisma.citizen.findFirst({
        where: { projectId: lookup.id },
      })
  }
}

export async function getCitizenCountByType(type: string): Promise<number> {
  return prisma.citizen.count({
    where: {
      type,
      attestationId: {
        not: null,
      },
    },
  })
}

export async function getCitizenById(id: number): Promise<Citizen | null> {
  return prisma.citizen.findUnique({
    where: { id },
  })
}

export async function getCitizenProposalVote(
  citizenId: number,
  proposalId: string,
): Promise<any> {
  return prisma.offChainVote.findFirst({
    where: {
      citizenId: citizenId,
      proposalId: proposalId,
    },
  })
}

export async function deleteCitizen(id: number) {
  return prisma.citizen.delete({
    where: { id },
  })
}
