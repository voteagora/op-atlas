export type OnchainBuildersDataType = Record<string, number>

export interface BaseMetrics {
  eligibility: {
    hasDefillamaAdapter: boolean
    hasQualifiedAddresses: boolean
  }
}

export interface OnchainBuilderMetrics extends BaseMetrics {
  activeAddresses?: OnchainBuildersDataType
  gasFees?: OnchainBuildersDataType
  transactions?: OnchainBuildersDataType
  tvl?: OnchainBuildersDataType
}

export interface DevToolingMetrics extends BaseMetrics {
  gasConsumption?: number
  trustedDevelopersCount?: number
}
