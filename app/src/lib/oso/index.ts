"server-only"

import { cache } from "react"

import {
  getDevToolingRecurringReward,
  getOnchainBuilderRecurringReward,
  getProjectActiveAddressesCount,
  getProjectEligibility,
  getProjectGasConsumption,
  getProjectGasFees,
  getProjectMetrics as getProjectMetricsFromDB,
  getProjectRewards,
  getProjectsOSO,
  getProjectTransactions,
  getProjectTvl,
  getTopProjectsFromOSO,
  getTrustedDevelopersCountFromOSO,
} from "@/db/projects"

import { TRANCHE_MONTHS_MAP } from "./constants"
import { Trend } from "./types"
import {
  formatActiveAddresses,
  formatDevToolingEligibility,
  formatDevToolingReward,
  formatEnrollement,
  formatGasConsumption,
  formatGasFees,
  formatHasDefillamaAdapter,
  formatMetricsData,
  formatOnchainBuilderEligibility,
  formatOnchainBuilderReward,
  formatTransactions,
  formatTvl,
  parseEligibilityResults,
  parseMetricsResults,
  parseRewardsResults,
  convertMonthMetricsToDateMetrics,
} from "./utils"

export const getProjectMetrics = cache(async function getProjectMetrics(
  projectId: string,
): Promise<{
  error?: string
  eligibility?: {
    devToolingEligibility: Record<string, boolean>
    onchainBuilderEligibility: Record<string, boolean>
    hasDefillamaAdapter: Record<string, boolean>
    devToolingEnrolment: Record<string, boolean>
    onchainBuilderEnrolment: Record<string, boolean>
  }
  onchainBuilderMetrics?: {
    activeAddresses: Record<string, { value: number; trend: Trend }>
    gasFees: Record<string, { value: number; trend: Trend }>
    transactions: Record<string, { value: number; trend: Trend }>
    tvl: Record<string, { value: number; trend: Trend }>
    onchainBuilderReward: Record<string, { value: number }>
  }
  devToolingMetrics?: {
    gasConsumption: Record<string, { value: number; trend: Trend }>
    trustedDevelopersCount: Record<string, number>
    topProjects: Record<
      string,
      {
        id?: string
        name?: string
        website?: string[]
        thumbnailUrl?: string | null
      }[]
    >
    devToolingReward: Record<string, { value: number }>
  }
  performanceMetrics?: {
    activeAddresses: Record<string, { value: number; trend: Trend }>
    gasFees: Record<string, { value: number; trend: Trend }>
    transactions: Record<string, { value: number; trend: Trend }>
    tvl: Record<string, { value: number; trend: Trend }>
  }
}> {
  if (!projectId) {
    return {
      error: "Project not found",
    }
  }

  const projectOSO = await getProjectsOSO(projectId)
  if (!projectOSO) {
    return {
      error: "Project not found",
    }
  }

  const [
    eligibilityResults,
    metricsResults,
    rewardsResults,
    gasConsumption,
    trustedDevelopersCount,
    topProjects,
    tvlResults,
  ] = await Promise.all([
    getProjectEligibility(projectId),
    getProjectMetricsFromDB(projectId),
    getProjectRewards(projectId),
    getGasConsumption(projectId),
    getTrustedDevelopersCount(projectId),
    getTopProjects(projectId),
    getTvl(projectId),
  ])

  // Format metrics from database (keyed by month names for Mission components)
  const activeAddressesFormatted = formatActiveAddresses(
    formatMetricsData(
      parseMetricsResults(metricsResults, "ACTIVE_ADDRESSES_COUNT"),
    ),
  )
  const gasFeesFormatted = formatGasFees(
    formatMetricsData(parseMetricsResults(metricsResults, "GAS_FEES")),
  )
  const transactionsFormatted = formatTransactions(
    formatMetricsData(parseMetricsResults(metricsResults, "TRANSACTION_COUNT")),
  )

  return {
    eligibility: {
      devToolingEligibility: formatDevToolingEligibility(
        parseEligibilityResults(eligibilityResults, "IS_DEV_TOOLING_ELIGIBLE"),
      ),
      onchainBuilderEligibility: formatOnchainBuilderEligibility(
        parseEligibilityResults(
          eligibilityResults,
          "IS_ONCHAIN_BUILDER_ELIGIBLE",
        ),
      ),
      hasDefillamaAdapter: formatHasDefillamaAdapter(
        parseEligibilityResults(eligibilityResults, "HAS_DEFILLAMA_ADAPTER"),
      ),
      devToolingEnrolment: formatEnrollement(
        parseEligibilityResults(eligibilityResults, "IS_DEV_TOOLING_ELIGIBLE"),
      ),
      onchainBuilderEnrolment: formatEnrollement(
        parseEligibilityResults(
          eligibilityResults,
          "IS_ONCHAIN_BUILDER_ELIGIBLE",
        ),
      ),
    },
    onchainBuilderMetrics: {
      activeAddresses: activeAddressesFormatted,
      gasFees: gasFeesFormatted,
      transactions: transactionsFormatted,
      tvl: tvlResults,
      onchainBuilderReward: formatOnchainBuilderReward(
        parseRewardsResults(rewardsResults, "8"),
      ),
    },
    devToolingMetrics: {
      gasConsumption,
      trustedDevelopersCount,
      topProjects,
      devToolingReward: formatDevToolingReward(
        parseRewardsResults(rewardsResults, "7"),
      ),
    },
    performanceMetrics: {
      // Convert month-based keys to date strings for Performance charts
      activeAddresses: convertMonthMetricsToDateMetrics(
        activeAddressesFormatted,
      ),
      gasFees: convertMonthMetricsToDateMetrics(gasFeesFormatted),
      transactions: convertMonthMetricsToDateMetrics(transactionsFormatted),
      tvl: convertMonthMetricsToDateMetrics(tvlResults),
    },
  }
})

// Onchain Builders Metrics
const getOnchainBuilderMetrics = cache(async function getOnchainBuilderMetrics(
  projectId: string,
) {
  const [activeAddresses, gasFees, transactions, tvl, onchainBuilderReward] =
    await Promise.all([
      getActiveAddresses(projectId),
      getGasFees(projectId),
      getTransactions(projectId),
      getTvl(projectId),
      getOnchainBuilderReward(projectId),
    ])

  return {
    activeAddresses,
    gasFees,
    transactions,
    tvl,
    onchainBuilderReward,
  }
})

const getActiveAddresses = cache(async (projectId: string) => {
  const activeAddressesCount = await getProjectActiveAddressesCount(projectId)
  const trancheData = Object.entries(TRANCHE_MONTHS_MAP).reduce(
    (acc, [tranche, month]) => ({
      ...acc,
      [month]: activeAddressesCount.filter(
        (p) => p.tranche === Number(tranche),
      ),
    }),
    {},
  )

  const output = formatActiveAddresses(trancheData)

  return output
})

const getGasFees = async function getGasFees(projectId: string) {
  const gasFees = await getProjectGasFees(projectId)
  const trancheData = Object.entries(TRANCHE_MONTHS_MAP).reduce(
    (acc, [tranche, month]) => ({
      ...acc,
      [month]: gasFees.filter((p) => p.tranche === Number(tranche)),
    }),
    {},
  )

  const output = formatGasFees(trancheData)

  return output
}

const getTransactions = async function getTransactions(projectId: string) {
  const transactions = await getProjectTransactions(projectId)
  const trancheData = Object.entries(TRANCHE_MONTHS_MAP).reduce(
    (acc, [tranche, month]) => ({
      ...acc,
      [month]: transactions.filter((p) => p.tranche === Number(tranche)),
    }),
    {},
  )

  const output = formatTransactions(trancheData)

  return output
}

const getTvl = async function getTvl(projectId: string) {
  const tvl = await getProjectTvl(projectId)
  const trancheData = Object.entries(TRANCHE_MONTHS_MAP).reduce(
    (acc, [tranche, month]) => ({
      ...acc,
      [month]: tvl.filter((p) => p.tranche === Number(tranche)),
    }),
    {},
  )

  const output = formatTvl(trancheData)

  return output
}

const getOnchainBuilderReward = cache(async (projectId: string) => {
  const onchainBuilderReward = await getOnchainBuilderRecurringReward(projectId)

  const output = formatOnchainBuilderReward(onchainBuilderReward)

  return output
})

const getDevToolingReward = cache(async (projectId: string) => {
  const devToolingReward = await getDevToolingRecurringReward(projectId)

  const output = formatDevToolingReward(devToolingReward)

  return output
})

// Dev Tooling Metrics
const getDevToolingMetrics = cache(async (projectId: string) => {
  const [
    gasConsumption,
    trustedDevelopersCount,
    topProjects,
    devToolingReward,
  ] = await Promise.all([
    getGasConsumption(projectId),
    getTrustedDevelopersCount(projectId),
    getTopProjects(projectId),
    getDevToolingReward(projectId),
  ])

  return {
    gasConsumption,
    trustedDevelopersCount,
    topProjects,
    devToolingReward,
  }
})

const getGasConsumption = cache(async (projectId: string) => {
  const gasConsumption = await getProjectGasConsumption(projectId)
  const trancheData = Object.entries(TRANCHE_MONTHS_MAP).reduce(
    (acc, [tranche, month]) => ({
      ...acc,
      [month]: gasConsumption.filter((p) => p.tranche === Number(tranche)),
    }),
    {},
  )

  const output = formatGasConsumption(trancheData)

  return output
})

const getTrustedDevelopersCount = cache(
  async function getTrustedDevelopersCount(osoId: string) {
    const trustedDevelopers = await getTrustedDevelopersCountFromOSO(osoId)
    const trancheData = Object.entries(TRANCHE_MONTHS_MAP).reduce(
      (acc, [tranche, month]) => ({
        ...acc,
        [month]: trustedDevelopers
          .filter((p) => p.tranche === Number(tranche))
          .reduce((acc, curr) => {
            return acc + Number(curr.value)
          }, 0),
      }),
      {},
    )

    return trancheData
  },
)

const getTopProjects = cache(async (osoId: string) => {
  const topProjects = await getTopProjectsFromOSO(osoId)

  const trancheData = Object.entries(TRANCHE_MONTHS_MAP).reduce(
    (acc, [tranche, month]) => ({
      ...acc,
      [month]: topProjects
        .filter((p) => p.tranche === Number(tranche))
        .slice(0, 6)
        .map((p) => ({
          id: p.targetProject.id,
          name: p.targetProject.name,
          thumbnailUrl: p.targetProject.thumbnailUrl,
          website: p.targetProject.website,
        })),
    }),
    {},
  )

  return trancheData
})

