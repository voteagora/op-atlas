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
  hasBundleBear: boolean
  devToolingReward: number
  devToolingEligible: boolean
  hasDefillamaAdapter: boolean
  onchainBuilderReward: number
  onchainBuilderEligible: boolean
  onchainBuildersInAtlasCount: number
  onchainBuildersOSOProjectIds: string[]
} | null
