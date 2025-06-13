"use server"
import { ProposalBadgeType } from "@/app/proposals/proposalsPage/components/ProposalCard"
import {
  OffChainProposalResponse,
  UIProposal,
} from "@/app/api/v1/proposals/route"
import { string } from "zod"

const getStandardProposlas = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/v1/proposals?type=OFFCHAIN`,
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

  // Transform the data to match your UI structure
  const standardProposals: UIProposal[] = offChainProposals.data.map(
    (proposal: any) => {
      // Determine badge type based on dates and status
      let badgeType = ProposalBadgeType.past
      const now = new Date()
      const startTime = new Date(proposal.startTime)
      const endTime = new Date(proposal.endTime)

      if (now < startTime) {
        badgeType = ProposalBadgeType.soon
      } else if (now >= startTime && now <= endTime) {
        badgeType = ProposalBadgeType.now
      }

      // Format dates for display (MM-DD-YYYY)
      const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date
          .toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, "-")
      }

      return {
        id: proposal.id,
        badge: {
          badgeType,
        },
        // Assuming these values will be filled later with user-specific data
        voted: false,
        passed: proposal.status === "EXECUTED",
        textContent: {
          title: proposal.markdowntitle,
          subtitle: "Voters, Citizens, Delegates", // Default subtitle
        },
        dates: {
          startDate: formatDate(proposal.startTime),
          endDate: formatDate(proposal.endTime),
        },
        arrow: {
          href: `/proposals/${proposal.id}`,
        },
      }
    },
  )
  return standardProposals
}

export const getProposals = async () => {
  const standardProposals = await getStandardProposlas()
  const selfNominations: UIProposal[] = []

  return {
    standardProposals: standardProposals,
    selfNominations: selfNominations,
  }
}

type ProposalData = {
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
  proposalType: string
  status: string
  createdTransactionHash?: string | null
  cancelledTransactionHash?: string | null
  executedTransactionHash?: string | null
  proposalTemplate?: object
}

export const getProposal = async (id: string): Promise<ProposalData> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/v1/proposals/${id}`,
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
