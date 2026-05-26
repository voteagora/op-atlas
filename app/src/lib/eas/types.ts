export type Entity =
  | "citizen"
  | "badgeholder"
  | "gov_contribution"
  | "rf_voter"
  | "votes"

export type EasTimestamp = bigint | number | string | Date

export type EasRecord = {
  id: string
  address: string
  attester: string
  created_at: EasTimestamp
  revoked_at: EasTimestamp | null
}

export type Citizen = EasRecord & {
  farcaster_id: string
  selection_method: string
}

export type Badgeholder = EasRecord & {
  rpgf_round: string
  referred_by: string
  referred_method: string | null
}

export type GovContribution = EasRecord & {
  gov_season: string
  gov_role: string
}

export type RfVoter = EasRecord & {
  farcaster_id: string
  round: string
  voter_type: string
  voting_group: string
  selection_method: string
}

export type Vote = EasRecord & {
  proposal_id: string
  params: string
  voter_id?: string
  voterId?: string
  block_number: EasTimestamp
}

export type Attestation = {
  id: string
  attester: string
  entity: Entity
  address: string
  name: string
  subtext: string
  metadata: Record<string, any>
}

export type AggregatedType = Record<Entity, Attestation[]>
