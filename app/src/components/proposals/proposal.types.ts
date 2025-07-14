import { Citizen, citizenCategory, User } from "@prisma/client"
import React from "react"

import { CardActionsProps } from "@/components/proposals/proposalPage/VotingSidebar/votingCard/VoterActions"
import { CitizenshipQualification } from "@/lib/types"
import { ProposalBadgeType } from "@/components/proposals/proposalsPage/components/ProposalCard"

export type OffChainProposalResponse = {
  meta: {
    has_next: boolean
    total_returned: number
    next_offset: number
  }
  data: OffChainProposal[]
}

export enum ProposalStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
  EXECUTED = "EXECUTED",
  QUEUED = "QUEUED",
  FAILED = "FAILED",
  DEFEATED = "DEFEATED",
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
  proposalResults?: object
  proposalType: ProposalType
}

export interface VotingRecordInterface {
  attestationId: string
  voterAddress: string
  vote: VoteType
  transactionHash?: string
  citizenId: number
  citizenType: citizenCategory
  createdAt: Date
  updatedAt: Date
}

// Vote type enum
export enum VoteType {
  For = "For",
  Abstain = "Abstain",
  Against = "Against",
  Veto = "Veto",
  Approval = "Approval",
}

export enum ProposalType {
  OFFCHAIN_STANDARD = "OFFCHAIN_STANDARD",
  OFFCHAIN_APPROVAL = "OFFCHAIN_APPROVAL",
  OFFCHAIN_OPTIMISTIC = "OFFCHAIN_OPTIMISTIC",
  HYBRID_STANDARD = "HYBRID_STANDARD",
  HYBRID_APPROVAL = "HYBRID_APPROVAL",
  HYBRID_OPTIMISTIC_TIERED = "HYBRID_OPTIMISTIC_TIERED",
}

export interface voteAction {
  buttonStyle: string
  actionText: string
  actionType: string
  action: (data?: any) => Promise<any>
  disabled?: boolean
  loading?: boolean
}

export interface VotingColumnProps {
  proposalType: string
  proposalId: string
  options?: CandidateCardProps[]
  votingActions?: CardActionsProps
  currentlyActive?: boolean
  userSignedIn?: boolean
  userCitizen?: Citizen
  userVoted?: boolean
  resultsLink: string
  updateVotingCardProps?: (updatedProps: Partial<VotingCardProps>) => void
}

export interface VotingCardProps {
  cardText: CardTextProps
  cardActions?: CardActionsProps
}

export interface CardTextProps {
  title: string
  descriptionElement?: string | React.ReactElement
}

export interface VoteButtonProps {
  textValue: string
  size?: "default" | "sm" | "lg" | "veto"
  variant?: "outline" | "filled"
  hover?: "yes" | "no"
  disabled?: "yes" | "no"
  iconLeft?: boolean
  iconRight?: boolean
  selected?: boolean
  voteType?: VoteType
  onClick?: () => void
}

export interface CandidateCardProps {
  user?: User
  qualification?: CitizenshipQualification
}
