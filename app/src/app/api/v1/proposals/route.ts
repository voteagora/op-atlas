// src/app/api/v1/proposals/route.ts
import { NextRequest, NextResponse } from "next/server"
import { ProposalBadgeType } from "@/app/proposals/proposalsPage/components/ProposalCard"

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
  proposalType: string
  status: "PENDING" | "ACTIVE" | "CANCELLED" | "EXECUTED" | "QUEUED" | "FAILED"
}

// For your UI components
export type UIProposal = {
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

export const GET = async (req: NextRequest) => {
  try {
    // Fetch off-chain proposals from external API
    const response = await fetch(
      "https://agora-next-optimism-r02lx00i6-voteagora.vercel.app/api/v1/proposals?type=OFFCHAIN",
      {
        headers: {
          Authorization: `Bearer ${process.env.AGORA_API_KEY}`,
          "Content-Type": "application/json",
        },
        cache: "no-store", // For dynamic data
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch off-chain proposals")
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

    return NextResponse.json({
      standardProposals,
      selfNominations: [], // You can populate this if needed
    })
  } catch (error) {
    console.error("Error fetching off-chain proposals:", error)
    return NextResponse.json(
      { error: "Failed to fetch proposals" },
      { status: 500 },
    )
  }
}
