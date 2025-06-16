export interface ProposalPageDataInterface {
  signedIn: boolean
  citizen?: Citizen
  votingOpen: boolean
  votingComplete: boolean
  voted: boolean
  votingRecord?: string[]
  startDate: Date
  endDate: Date
  proposalType: string
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
  type: string
  attestationId: string | null
  timeCommitment: string | null
  createdAt: Date
  updatedAt: Date
}
