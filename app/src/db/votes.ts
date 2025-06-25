"use server"

import { citizenCategory } from "@prisma/client"

import { OffchainVote } from "@/components/proposals/proposal.types"
import { prisma } from "@/db/client"

/**
 * Creates a new OffChainVote record in the database
 * @param offchainVote OffchainVote object
 * @returns The created OffChainVote record
 */
export const postOffchainVote = async (offchainVote: OffchainVote) => {
  // If the first parameter is an OffchainVote object
  return prisma.offChainVote.create({
    data: {
      attestationId: offchainVote.attestationId,
      voterAddress: offchainVote.voterAddress,
      proposalId: offchainVote.proposalId,
      vote: offchainVote.vote,
      transactionHash: offchainVote.transactionHash,
      citizenId: offchainVote.citizenId,
      citizenCategory:
        offchainVote.citizenType.toUpperCase() as citizenCategory,
      updatedAt: new Date(),
    },
  })
}

/**
 * Updates an existing OffChainVote record or creates a new one if it doesn't exist
 * @param offchainVote Either an OffchainVote object or the attestationId string
 * @returns The upserted OffChainVote record
 */
export const upsertOffchainVote = async (offchainVote: OffchainVote) => {
  // If the first parameter is an OffchainVote object
  return prisma.offChainVote.upsert({
    where: {
      attestationId: offchainVote.attestationId,
    },
    update: {
      voterAddress: offchainVote.voterAddress,
      proposalId: offchainVote.proposalId,
      vote: offchainVote.vote,
      transactionHash: offchainVote.transactionHash,
      citizenId: offchainVote.citizenId,
      citizenCategory:
        offchainVote.citizenType?.toUpperCase() as citizenCategory,
      updatedAt: new Date(),
    },
    create: {
      attestationId: offchainVote.attestationId,
      voterAddress: offchainVote.voterAddress,
      proposalId: offchainVote.proposalId,
      vote: offchainVote.vote,
      transactionHash: offchainVote.transactionHash,
      citizenId: offchainVote.citizenId,
      citizenCategory:
        offchainVote.citizenType?.toUpperCase() as citizenCategory,
      updatedAt: new Date(),
    },
  })
}
