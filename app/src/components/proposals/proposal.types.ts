import { citizenCategory, User } from "@prisma/client"
import { CitizenshipQualification } from "@/lib/types"
import { CardActionsProps } from "@/components/proposals/proposalPage/VotingSidebar/VotingActions"
import { CandidateCardProps } from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/VotingColumn"

export interface ProposalPageDataInterface {
  user: User | null
  citizen?: Citizen
  votingOpen: boolean
  votingComplete: boolean
  voted: boolean
  votingRecord?: string[]
  startDate: Date
  endDate: Date
  proposalType: ProposalType
  proposalId: string
  proposalStatus: string
  citizenEligibility: CitizenshipQualification | null
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

export type Citizen = {
  id: number
  userId: string
  address: string | null
  type: citizenCategory
  attestationId: string | null
  timeCommitment: string | null
  createdAt: Date
  updatedAt: Date
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
}

export interface VotingRedirectProps {
  callout: string
  link?: {
    linkText: string
    linkHref: string
  }
}
