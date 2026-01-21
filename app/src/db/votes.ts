"use server"

import type { PrismaClient } from "@prisma/client"

import { prisma } from "./client"

export const getVoteForCitizen = async (
  proposalId: string,
  citizenId: number,
  db: PrismaClient = prisma,
) => {
  return db.offChainVote.findFirst({
    where: {
      proposalId: proposalId,
      citizenId: citizenId,
    },
  })
}
