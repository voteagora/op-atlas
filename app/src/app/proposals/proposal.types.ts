import { CITIZEN_TYPES } from "@/lib/constants"
import { citizenCategory } from "@prisma/client"

export interface ProposalPageDataInterface {
  signedIn: boolean
  citizen?: Citizen
  votingOpen: boolean
  votingComplete: boolean
  voted: boolean
  votingRecord?: string[]
  startDate: Date
  endDate: Date
  proposalType: ProposalType
  proposalId: string
  citizenEligibility: CitizenEligibility
}

export interface CitizenEligibility {
  organization?: {
    name: string
    logo: string
    eligible: boolean
  }
  application?: {
    name: string
    logo: string
    eligible: boolean
  }
  user: {
    eligible: boolean
    pfp: string
  }
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
