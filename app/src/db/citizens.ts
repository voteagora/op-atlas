"use server"

import { Citizen } from "@prisma/client"

import { prisma } from "@/db/client"
import { VoteType } from "@/app/proposals/components/VotingSidebar/votingColumn/VotingColumn"

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

export async function getUserCitizen(id: string): Promise<Citizen | null> {
  return prisma.citizen.findUnique({
    where: {
      userId: id,
    },
  })
}

export async function getCitizenCountByType(type: string): Promise<number> {
  return prisma.citizen.count({
    where: {
      type,
    },
  })
}

export async function getCitizenVotes(citizenId: number): Promise<any> {
  return prisma.offChainVote.findMany({
    where: {
      citizenId: citizenId,
    },
  })
}

export async function getCitizenProposalVote(
  citizenId: number,
  proposalId: string,
): Promise<any> {
  return prisma.offChainVote.findFirst({
    where: {
      proposalId: proposalId,
      citizenId: citizenId,
    },
  })
}

export async function postCitizenProposalVote(
  voteType: VoteType,
): Promise<any> {
  // citizenId: number,
  // proposalId: string,
  // vote: number,
  console.log(`postCitizenProposalVote Not Implemented`)
  console.log("postCitizenProposalVote VoteType: ", voteType)
}
