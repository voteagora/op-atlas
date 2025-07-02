"use server"

import { prisma } from "@/db/client"

export const getVoteForCitizen = async (
  proposalId: string,
  citizenId: number,
) => {
  return prisma.offChainVote.findFirst({
    where: {
      proposalId: proposalId,
      citizenId: citizenId,
    },
  })
}
