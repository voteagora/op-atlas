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
  applicationDate: Date
}

export interface OnchainBuilderMissionProps extends BaseMissionProps {
  type: "on-chain"
  onchainBuilderMetrics: {
    activeAddresses: Record<string, { value: number; trend: Trend }>
    gasFees: Record<string, { value: number; trend: Trend }>
    transactions: Record<string, { value: number; trend: Trend }>
    tvl: Record<string, { value: number; trend: Trend }>
    onchainBuilderReward: Record<string, number>
  }
  eligibility: {
    hasDefillamaAdapter: boolean
    hasQualifiedAddresses: boolean
    deployedOnWorldchain: boolean
    onchainBuilderEligibility: boolean
  }
}

export interface DevToolingMissionProps extends BaseMissionProps {
  type: "dev-tooling"
  metrics: {
    gasConsumption?: number
    trustedDevelopersCount?: number
    eligibility: {
      hasDefillamaAdapter: boolean
      hasQualifiedAddresses: boolean
    }
  }
  projectOSOData?: {
    topProjects?: {
      id?: string
      name?: string
      website?: string[]
      thumbnailUrl?: string
    }[]
    devToolingReward?: number
    devToolingEligible?: boolean
    onchainBuildersInAtlasCount?: number
    projectsGasConsumption: number
  } | null
}

export type MissionProps = OnchainBuilderMissionProps | DevToolingMissionProps
