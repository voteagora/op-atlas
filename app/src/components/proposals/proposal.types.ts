import { Citizen, citizenCategory, User } from "@prisma/client"
import React from "react"

import { CardActionsProps } from "@/components/proposals/proposalPage/VotingSidebar/votingCard/VoterActions"
import { CitizenshipQualification } from "@/lib/types"

export interface ProposalPageDataInterface {
  user: User | null
  citizen?: Citizen
  votingOpen: boolean
  votingComplete: boolean
  voted: boolean
  votingRecord?: VotingRecordInterface
  startDate: Date
  endDate: Date
  proposalType: ProposalType
  proposalId: string
  proposalStatus: string
  citizenEligibility: CitizenshipQualification | null
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

export enum ProposalStatus {
  ACTIVE = "ACTIVE",
  EXECUTED = "EXECUTED",
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
  QUEUED = "QUEUED",
  DEFEATED = "DEFEATED",
  SUCCEEDED = "SUCCEEDED",
}

export enum ProposalType {
  OFFCHAIN_STANDARD = "OFFCHAIN_STANDARD",
  OFFCHAIN_APPROVAL = "OFFCHAIN_APPROVAL",
  OFFCHAIN_OPTIMISTIC = "OFFCHAIN_OPTIMISTIC",
  OFFCHAIN_OPTIMISTIC_TIERED = "OFFCHAIN_OPTIMISTIC_TIERED",
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
  needsAgoraLink?: boolean
  proposalId?: string
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

export interface ProposalResultOption {
  isApproved: boolean
  option: string
  weightedPercentage: number
}
