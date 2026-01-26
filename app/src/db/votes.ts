"use server"

import type { PrismaClient } from "@prisma/client"

import { prisma } from "./client"

export const getVoteForCitizen = async (
  proposalId: string,
  citizenIdOrAddress: number | string,
  db: PrismaClient = prisma,
) => {
  const isAddress = typeof citizenIdOrAddress === "string"
  
  return db.offChainVote.findFirst({
    where: {
      proposalId: proposalId,
      ...(isAddress
        ? { voterAddress: { equals: citizenIdOrAddress, mode: "insensitive" } }
        : { citizenId: citizenIdOrAddress }),
    },
  })
}
