// src/app/api/v1/proposals/route.ts
import { NextRequest, NextResponse } from "next/server"
import { ProposalBadgeType } from "@/app/proposals/proposalsPage/components/ProposalCard"
import { getProposals } from "@/lib/proposals"

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

export const GET = async (req: NextRequest) => {
  try {
    const data = await getProposals()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch proposals" },
      { status: 500 },
    )
  }
}
