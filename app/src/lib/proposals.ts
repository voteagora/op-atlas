"use server"
import {
  ProposalStatus,
  ProposalType,
} from "@/components/proposals/proposal.types"
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
  status: ProposalStatus
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

const getStandardProposals = async (offset?: number) => {
  const offsetVal = offset ? `&offset=${offset}` : ""
  try {
    const response = await fetch(
      // Replace with EXCLUDE_ONCHAIN after agora-next API PR changes
      `${process.env.NEXT_PUBLIC_AGORA_API_URL}/api/v1/proposals?type=OFFCHAIN${offsetVal}`,
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
        } else if (
          CURRENT_DATETIME >= startTime &&
          CURRENT_DATETIME <= endTime
        ) {
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
            subtitle: proposal.proposalType.includes("HYBRID")
              ? "Voters: Citizens, Delegates"
              : "Voters: Citizens",
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
    return { proposals: standardProposals, pagination: offChainProposals.meta }
  } catch (error) {
    console.error(`Failed to fetch Off-chain Proposals: ${error}`)
    return {
      proposals: [],
      pagination: {
        has_next: false,
        total_returned: 0,
        next_offset: 0,
      },
    }
  }
}

export const getProposals = async (page?: number) => {
  const standardProposals = await getStandardProposals(page)
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
  status: ProposalStatus
  createdTransactionHash?: string | null
  cancelledTransactionHash?: string | null
  executedTransactionHash?: string | null
  proposalTemplate?: object
  // This value should always be included in offchain and hybrid proposals
  offchainProposalId: string
}

export const enrichProposalData = async (
  proposals: {
    standardProposals:
      | UIProposal[]
      | {
          proposals: UIProposal[]
          pagination:
            | {
                has_next?: boolean
                total_returned?: number
                next_offset?: number
              }
            | {}
        }
    selfNominations: UIProposal[]
  },
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

  // Extract the standard proposals array based on the structure
  const standardProposalsArray = Array.isArray(proposals.standardProposals)
    ? proposals.standardProposals
    : proposals.standardProposals.proposals || []

  // Process both types of proposals using the helper function
  const enrichedStandardProposals = await Promise.all(
    standardProposalsArray.map(enrichSingleProposal),
  )

  const enrichedSelfNominations = await Promise.all(
    proposals.selfNominations.map(enrichSingleProposal),
  )

  // Create a properly typed pagination object with all required fields
  const pagination: {
    has_next: boolean
    total_returned: number
    next_offset: number
  } = {
    has_next: false,
    total_returned: 0,
    next_offset: 0,
  }

  // Check if standardProposals is not an array and has pagination
  if (!Array.isArray(proposals.standardProposals)) {
    const paginationObj = proposals.standardProposals.pagination

    // Check if each property exists on the pagination object using type guards
    if (paginationObj && typeof paginationObj === "object") {
      if ("has_next" in paginationObj && paginationObj.has_next !== undefined) {
        pagination.has_next = paginationObj.has_next
      }

      if (
        "total_returned" in paginationObj &&
        paginationObj.total_returned !== undefined
      ) {
        pagination.total_returned = Number(paginationObj.total_returned)
      }

      if (
        "next_offset" in paginationObj &&
        paginationObj.next_offset !== undefined
      ) {
        pagination.next_offset = Number(paginationObj.next_offset)
      }
    }
  }

  return {
    standardProposals: {
      proposals: enrichedStandardProposals,
      pagination: pagination,
    },
    selfNominations: enrichedSelfNominations,
  }
}

export const getEnrichedProposalData = async ({
  userId,
  offset,
}: {
  userId?: string
  offset?: number
}) => {
  try {
    // Get the proposal data from the API
    const proposalData = await getProposals(offset)
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
    return {
      standardProposals: {
        proposals: [],
        pagination: {
          has_next: false,
          total_returned: 0,
          next_offset: 0,
        },
      },
      selfNominations: [],
    }
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
