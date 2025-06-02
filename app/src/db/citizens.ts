"use server"

import { Citizen } from "@prisma/client"

import { prisma } from "@/db/client"

export async function upsertCitizen({
  id,
  citizen,
}: {
  id: string
  citizen: {
    type: string
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

export async function getCitizenVotes(citizenId: number): Promise<any> {
  return prisma.citizenVotes.findMany({
    where: {
      citizenId: citizenId,
    },
  })
}

export async function getCitizenProposalVote(
  id: number,
  proposalId: string,
): Promise<any> {
  return prisma.citizenVotes.findUnique({
    where: {
      citizenId_proposalId: {
        citizenId: id,
        proposalId: proposalId,
      },
    },
  })
}
