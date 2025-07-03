"use server"
import { ProposalType } from "@/components/proposals/proposal.types"
import { ProposalBadgeType } from "@/components/proposals/proposalsPage/components/ProposalCard"
import { getCitizenByType, getCitizenProposalVote } from "@/db/citizens"

import { formatMMMd } from "./utils/date"

const CURRENT_DATETIME = new Date()

export type OffChainProposalResponse = {
  meta: {
    has_next: boolean
    total_returned: number
    next_offset: number
  }
  data: OffChainProposal[]
}

export type OffChainProposal = {
  id: string
  proposer: string
  snapshotBlockNumber: number
  createdTime: string
  startTime: string
  startBlock: string
  endTime: string
  endBlock: string
  cancelledTime: string | null
  executedTime: string | null
  executedBlock: string | null
  queuedTime: string | null
  markdowntitle: string
  description: string
  quorum: string
  proposalData: object // We can define this more specifically if needed
  proposalResults: object // We can define this more specifically if needed
  proposalType: ProposalType
  status: "PENDING" | "ACTIVE" | "CANCELLED" | "EXECUTED" | "QUEUED" | "FAILED"
  offchainProposalId: string
}

// For UI
export type UIProposal = {
  id: string
  badge: {
    badgeType: ProposalBadgeType
  }
  voted?: boolean
  passed?: boolean
  textContent: {
    title: string
    subtitle?: string
  }
  dates: {
    startDate: string
    endDate: string
  }
  arrow: {
    href: string
  }
}

const getStandardProposals = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_AGORA_API_URL}/api/v1/proposals?type=EXCLUDE_ONCHAIN`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AGORA_API_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // For dynamic data
    },
  )

  if (!response.ok) {
    throw new Error(
      `Failed to fetch off-chain proposals ${response.statusText}`,
    )
  }

  const offChainProposals: OffChainProposalResponse = await response.json()
  // Transform the data to match UI structure
  const standardProposals: UIProposal[] = offChainProposals.data.map(
    (proposal: any) => {
      // Determine badge type based on dates and status
      // Defaults to past
      let badgeType = ProposalBadgeType.past
      const startTime = new Date(proposal.startTime)
      const endTime = new Date(proposal.endTime)

      if (CURRENT_DATETIME < startTime) {
        badgeType = ProposalBadgeType.soon
      } else if (CURRENT_DATETIME >= startTime && CURRENT_DATETIME <= endTime) {
        badgeType = ProposalBadgeType.now
      }

      const offchainProposalId = proposal.proposalType.includes("HYBRID")
        ? proposal.offchainProposalId
        : proposal.id
      return {
        id: offchainProposalId,
        badge: {
          badgeType,
        },
        // Assuming these values will be filled later with user-specific data
        voted: false,
        passed: ["SUCCEEDED", "QUEUED", "EXECUTED"].includes(proposal.status),
        textContent: {
          title: proposal.markdowntitle,
          subtitle: "Voters: Citizens, Delegates", // Default subtitle
        },
        dates: {
          startDate: formatMMMd(proposal.startTime),
          endDate: formatMMMd(proposal.endTime),
        },
        arrow: {
          href: `/proposals/${offchainProposalId}`,
        },
      }
    },
  )
  return standardProposals
}

export const getProposals = async () => {
  const standardProposals = await getStandardProposals()
  const selfNominations: UIProposal[] = []

  return {
    standardProposals: standardProposals,
    selfNominations: selfNominations,
  }
}

export type ProposalData = {
  id: string
  proposer: string
  snapshotBlockNumber: number
  createdTime: string
  startTime: string
  startBlock?: string
  endTime: string
  endBlock?: string
  cancelledTime?: string | null
  executedTime?: string | null
  executedBlock?: string | null
  queuedTime?: string | null
  markdowntitle: string
  description: string
  quorum: string
  approvalThreshold?: string
  proposalData: object
  unformattedProposalData?: string | null
  proposalResults: object
  proposalType: ProposalType
  status: "PENDING" | "ACTIVE" | "CANCELLED" | "EXECUTED" | "QUEUED" | "FAILED"
  createdTransactionHash?: string | null
  cancelledTransactionHash?: string | null
  executedTransactionHash?: string | null
  proposalTemplate?: object
}

export const enrichProposalData = async (
  proposals: { standardProposals: UIProposal[]; selfNominations: UIProposal[] },
  citizenId: number,
) => {
  // Helper function to enrich a single proposal with vote information
  const enrichSingleProposal = async (
    proposal: UIProposal,
  ): Promise<UIProposal> => {
    const offchainVote = await getCitizenProposalVote(citizenId, proposal.id)

    // Check if we have a valid citizen with vote data
    const hasVoted = !!offchainVote?.vote && Array.isArray(offchainVote.vote)

    const isVotedProposal = hasVoted && offchainVote.proposalId === proposal.id

    return {
      ...proposal,
      voted: isVotedProposal ? true : proposal.voted,
    }
  }

  // Process both types of proposals using the helper function
  const enrichedStandardProposals = await Promise.all(
    proposals.standardProposals.map(enrichSingleProposal),
  )

  const enrichedSelfNominations = await Promise.all(
    proposals.selfNominations.map(enrichSingleProposal),
  )

  return {
    standardProposals: enrichedStandardProposals,
    selfNominations: enrichedSelfNominations,
  }
}

export const getEnrichedProposalData = async ({
  userId,
}: {
  userId?: string
}) => {
  try {
    // Get the proposal data from the API
    const proposalData = await getProposals()
    try {
      if (!userId) {
        return proposalData
      }

      // Get the citizen data from DB
      const citizen = await getCitizenByType({ type: "user", id: userId })
      if (!citizen) {
        return proposalData
      }

      // Enrich the proposal data with citizen data for conditional vote status rendering
      return enrichProposalData(proposalData, citizen.id)
    } catch (error) {
      console.error(`Failed to fetch Citizen Data: ${error}`)
      // If we can't get citizen data, just return the proposal data as is
      return proposalData
    }
  } catch (error) {
    console.error(`Failed to fetch Proposal Data: ${error}`)
    // If we can't get proposal data, return empty arrays
    return { standardProposals: [], selfNominations: [] }
  }
}

export const getProposal = async (id: string): Promise<ProposalData> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_AGORA_API_URL}/api/v1/proposals/${id}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AGORA_API_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // For dynamic data
    },
  )

  if (!response.ok) {
    throw new Error(
      `Failed to fetch off-chain proposals ${response.statusText}`,
    )
  }
  return await response.json()
}
