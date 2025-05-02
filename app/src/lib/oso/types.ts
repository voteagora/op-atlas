export type Trend = { value: number; sign: "inc" | "dec" | null }

export type MetricValues = {
  sampleDate: string
  amount: number
}

export type ProjectOSOData = {
  topProjects?: {
    id?: string
    name?: string
    website?: string[]
    thumbnailUrl?: string
  }[]
  devToolingReward: number
  devToolingEligible: boolean
  hasDefillamaAdapter: boolean
  onchainBuilderReward: number
  onchainBuilderEligible: boolean
  onchainBuildersInAtlasCount: number
  onchainBuildersOSOProjectIds: string[]
} | null

export type OnchainBuildersDataType = Record<string, number>

export interface BaseMissionProps {
  isMember: boolean
  projectName: string
}

export type OnchainBuilderMetrics = {
  activeAddresses: Record<string, { value: number; trend: Trend }>
  gasFees: Record<string, { value: number; trend: Trend }>
  transactions: Record<string, { value: number; trend: Trend }>
  tvl: Record<string, { value: number; trend: Trend }>
  onchainBuilderReward: Record<string, { value: number }>
}

export type PerformanceMetrics = {
  activeAddresses: Record<string, { value: number; trend: Trend }>
  gasFees: Record<string, { value: number; trend: Trend }>
  transactions: Record<string, { value: number; trend: Trend }>
  tvl: Record<string, { value: number; trend: Trend }>
}

export interface OnchainBuilderMissionProps extends BaseMissionProps {
  type: "on-chain"
  onchainBuilderMetrics?: {
    activeAddresses: Record<string, { value: number; trend: Trend }>
    gasFees: Record<string, { value: number; trend: Trend }>
    transactions: Record<string, { value: number; trend: Trend }>
    tvl: Record<string, { value: number; trend: Trend }>
    onchainBuilderReward: Record<string, { value: number }>
  }
  eligibility?: {
    hasDefillamaAdapter: Record<string, boolean>
    hasQualifiedAddresses: boolean
    deployedOnWorldchain: boolean
    onchainBuilderEligibility: Record<string, boolean>
    onchainBuilderEnrolment: Record<string, boolean>
  }
}

export interface DevToolingMissionProps extends BaseMissionProps {
  type: "dev-tooling"
  devToolingMetrics?: {
    gasConsumption: Record<string, { value: number; trend: Trend }>
    trustedDevelopersCount: Record<string, number>
    devToolingReward: Record<string, { value: number }>
    topProjects: Record<
      string,
      {
        id?: string
        name?: string
        website?: string[]
        thumbnailUrl?: string | null
      }[]
    >
  }
  eligibility?: {
    devToolingEligibility: Record<string, boolean>
    devToolingEnrolment: Record<string, boolean>
  }
}

export type MissionProps = OnchainBuilderMissionProps | DevToolingMissionProps
