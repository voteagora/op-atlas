export type OnchainBuildersDataType = Record<string, number>

export interface BaseMissionProps {
  isMember: boolean
  projectName: string
  opReward: number | null
  applicationDate?: Date
}

export interface OnchainBuilderMissionProps extends BaseMissionProps {
  type: "on-chain"
  deployedOnWorldchain?: boolean
  metrics: {
    activeAddresses?: OnchainBuildersDataType
    gasFees?: OnchainBuildersDataType
    transactions?: OnchainBuildersDataType
    tvl?: OnchainBuildersDataType
    eligibility: {
      hasDefillamaAdapter: boolean
      hasQualifiedAddresses: boolean
      hasBundleBear: boolean
    }
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
      hasBundleBear: boolean
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
