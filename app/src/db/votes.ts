"use server"

import { prisma } from "@/db/client"
import { citizenCategory } from "@prisma/client"
import { OffchainVote } from "@/app/proposals/proposal.types"

/**
 * Creates a new OffChainVote record in the database
 * @param voteOrAttestationId Either an OffchainVote object or the attestationId string
 * @param voterAddress The address of the voter (required if first param is attestationId)
 * @param proposalId The ID of the proposal (required if first param is attestationId)
 * @param vote The vote object (required if first param is attestationId)
 * @param citizenId The ID of the citizen (required if first param is attestationId)
 * @param options Additional options (transactionHash, citizenCategory)
 * @returns The created OffChainVote record
 */
export const postOffchainVote = async (
  voteOrAttestationId: OffchainVote | string,
  voterAddress?: string,
  proposalId?: string,
  vote?: object,
  citizenId?: number,
  options?: {
    transactionHash?: string
    citizenCategory?: citizenCategory
  },
) => {
  console.log("voteOrAttestationId", voteOrAttestationId)
  // If the first parameter is an OffchainVote object
  if (typeof voteOrAttestationId !== "string") {
    const vote = voteOrAttestationId
    return prisma.offChainVote.create({
      data: {
        attestationId: vote.attestationId,
        voterAddress: vote.voterAddress,
        proposalId: vote.proposalId,
        vote: vote.vote,
        transactionHash: vote.transactionHash,
        citizenId: vote.citizenId,
        citizenCategory: vote.citizenType,
        updatedAt: new Date(),
      },
    })
  }

  // If the first parameter is an attestationId string
  if (!voterAddress || !proposalId || !vote || !citizenId) {
    throw new Error("Missing required parameters for creating an OffChainVote")
  }

  return prisma.offChainVote.create({
    data: {
      attestationId: voteOrAttestationId,
      voterAddress,
      proposalId,
      vote,
      transactionHash: options?.transactionHash,
      citizenId,
      citizenCategory: options?.citizenCategory || "CHAIN",
      updatedAt: new Date(),
    },
  })
}

/**
 * Updates an existing OffChainVote record or creates a new one if it doesn't exist
 * @param voteOrAttestationId Either an OffchainVote object or the attestationId string
 * @param voterAddress The address of the voter (required if first param is attestationId)
 * @param proposalId The ID of the proposal (required if first param is attestationId)
 * @param vote The vote object (required if first param is attestationId)
 * @param citizenId The ID of the citizen (required if first param is attestationId)
 * @param options Additional options (transactionHash, citizenCategory)
 * @returns The upserted OffChainVote record
 */
export const upsertOffchainVote = async (
  voteOrAttestationId: OffchainVote | string,
  voterAddress?: string,
  proposalId?: string,
  vote?: object,
  citizenId?: number,
  options?: {
    transactionHash?: string
    citizenCategory?: citizenCategory
  },
) => {
  // If the first parameter is an OffchainVote object
  if (typeof voteOrAttestationId !== "string") {
    const vote = voteOrAttestationId
    return prisma.offChainVote.upsert({
      where: {
        attestationId: vote.attestationId,
      },
      update: {
        voterAddress: vote.voterAddress,
        proposalId: vote.proposalId,
        vote: vote.vote,
        transactionHash: vote.transactionHash,
        citizenId: vote.citizenId,
        citizenCategory: vote.citizenType?.toUpperCase() as citizenCategory,
        updatedAt: new Date(),
      },
      create: {
        attestationId: vote.attestationId,
        voterAddress: vote.voterAddress,
        proposalId: vote.proposalId,
        vote: vote.vote,
        transactionHash: vote.transactionHash,
        citizenId: vote.citizenId,
        citizenCategory: vote.citizenType?.toUpperCase() as citizenCategory,
        updatedAt: new Date(),
      },
    })
  }

  // If the first parameter is an attestationId string
  if (!voterAddress || !proposalId || !vote || !citizenId) {
    throw new Error("Missing required parameters for upserting an OffChainVote")
  }

  return prisma.offChainVote.upsert({
    where: {
      attestationId: voteOrAttestationId,
    },
    update: {
      voterAddress,
      proposalId,
      vote,
      transactionHash: options?.transactionHash,
      citizenId,
      citizenCategory: options?.citizenCategory || "CHAIN",
      updatedAt: new Date(),
    },
    create: {
      attestationId: voteOrAttestationId,
      voterAddress,
      proposalId,
      vote,
      transactionHash: options?.transactionHash,
      citizenId,
      citizenCategory: options?.citizenCategory || "CHAIN",
      updatedAt: new Date(),
    },
  })
}
