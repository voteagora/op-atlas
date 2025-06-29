import { Citizen, citizenCategory, User } from "@prisma/client"
import React from "react"

import { CardActionsProps } from "@/components/proposals/proposalPage/VotingSidebar/votingCard/VoterActions"
import { CandidateCardProps } from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/VotingColumn"
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
}

export enum ProposalType {
  OFFCHAIN_STANDARD = "OFFCHAIN_STANDARD",
  OFFCHAIN_APPROVAL = "OFFCHAIN_APPROVAL",
  OFFCHAIN_OPTIMISTIC = "OFFCHAIN_OPTIMISTIC",
}

export interface voteAction {
  buttonStyle: string
  actionText: string
  actionType: string
  action: (data?: any) => Promise<any>
  disabled?: boolean
  loading?: boolean
}

export interface OffchainVote {
  attestationId: string
  voterAddress: string
  proposalId: string
  vote: object
  transactionHash?: string
  citizenId: number
  citizenType: citizenCategory
  createdAt?: Date
  updatedAt?: Date
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
