"server-only"

import { gql, GraphQLClient } from "graphql-request"
import { cache } from "react"

import {
  createOSOProjects,
  getDefillamaAdapter,
  getDevToolingEligibility,
  getDevToolingRecurringReward,
  getOnchainBuilderEligibility,
  getOnchainBuilderRecurringReward,
  getProjectActiveAddressesCount,
  getProjectEligibility,
  getProjectGasConsumption,
  getProjectGasFees,
  getProjectMetrics as getProjectMetricsFromDB,
  getProjectOSORelatedProjects,
  getProjectRewards,
  getProjectsOSO,
  getProjectTransactions,
  getProjectTvl,
  getTopProjectsFromOSO,
  getTrustedDevelopersCountFromOSO,
} from "@/db/projects"
import {
  OrderBy,
  Oso_ArtifactsByProjectV1,
  Oso_ProjectsByCollectionV1,
  Oso_ProjectsV1,
  Oso_TimeseriesMetricsByProjectV0,
  QueryOso_ArtifactsByProjectV1Args,
  QueryOso_ProjectsByCollectionV1Args,
  QueryOso_ProjectsV1Args,
  QueryOso_TimeseriesMetricsByProjectV0Args,
} from "@/graphql/__generated__/types"
import { OSO_METRICS } from "@/lib/constants"
import osoGqlClient from "@/lib/oso-client"
import client from "@/lib/oso-client"
import {
  OsoDeployerContractsReturnType,
  ParsedOsoDeployerContract,
} from "@/lib/types"

import {
  BATCH_SIZE,
  OSO_QUERY_DATES,
  OSO_QUERY_TRANCHE_CUTOFF_DATES,
  supportedMappings,
  TRANCHE_MONTHS_MAP,
} from "./constants"
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
  formatPerformanceMetrics,
  formatTransactions,
  formatTvl,
  parseEligibilityResults,
  parseMetricsResults,
  parseRewardsResults,
} from "./utils"
import { Application } from "@prisma/client"

export const osoClient = new GraphQLClient(
  "https://www.opensource.observer/api/v1/graphql",
  {
    headers: {
      Authorization: `Bearer ${process.env.OSO_AUTH_TOKEN}`,
    },
  },
)

export const getDeployedContractsServer = cache(
  async function getDeployedContractsServer(
    deployer: string,
  ): Promise<OsoDeployerContractsReturnType> {
    const variables = {
      where: {
        rootDeployerAddress: { _eq: deployer.toLowerCase() },
        factoryAddress: { _eq: "" },
      },
    }

    const query = gql`
      query ContractQuery($where: Oso_ContractsV0BoolExp) {
        oso_contractsV0(where: $where) {
          contractAddress
          contractNamespace
          rootDeployerAddress
          factoryAddress
        }
      }
    `
    const req: OsoDeployerContractsReturnType = await osoClient.request(
      query,
      variables,
    )

    return req
  },
)

export const getDeployedContractsServerParsed = cache(
  async function getDeployedContractsServerParsed(
    deployer: string,
  ): Promise<ParsedOsoDeployerContract[]> {
    const contracts = await getDeployedContractsServer(deployer)
    return parseOsoDeployerContract(contracts)
  },
)

const queryMetrics = cache(async function queryMetrics(
  osoId: string[],
  key: keyof typeof OSO_METRICS,
  sampleDate = {
    _gte: OSO_QUERY_DATES.DEFAULT.start,
    _lte: OSO_QUERY_DATES.DEFAULT.end,
  },
) {
  const query: QueryOso_TimeseriesMetricsByProjectV0Args = {
    where: {
      projectId: {
        _in: osoId,
      },
      metricId: {
        _in: OSO_METRICS[key],
      },
      sampleDate: {
        _gte: sampleDate._gte,
        _lte: sampleDate._lte,
      },
    },
    order_by: [
      {
        sampleDate: OrderBy.Asc,
      },
    ],
  }
  const select: (keyof Oso_TimeseriesMetricsByProjectV0)[] = [
    "sampleDate",
    "amount",
  ]
  const result = await osoGqlClient.executeQuery(
    "oso_timeseriesMetricsByProjectV0",
    query,
    select,
  )
  return result.oso_timeseriesMetricsByProjectV0
})

export const mapOSOProjects = cache(async function mapOSOProjects(
  projectAtlasIds: string[],
) {
  let mapped = 0
  let totalCreated = 0

  for (let i = 0; i < projectAtlasIds.length; i += BATCH_SIZE) {
    const batchIds = projectAtlasIds.slice(i, i + BATCH_SIZE)

    const projectsQuery: QueryOso_ProjectsV1Args = {
      where: {
        projectName: { _in: batchIds },
        projectSource: { _eq: "OP_ATLAS" },
      },
    }

    const projectsSelect: (keyof Oso_ProjectsV1)[] = [
      "projectId",
      "projectName",
    ]

    const osoProjects = await client.executeQuery(
      "oso_projectsV1",
      projectsQuery,
      projectsSelect,
    )

    const collectionQuery: QueryOso_ProjectsByCollectionV1Args = {
      where: { projectName: { _in: batchIds } },
    }

    const collectionSelect: (keyof Oso_ProjectsByCollectionV1)[] = [
      "collectionName",
      "projectId",
      "projectName",
    ]

    const collections = await client.executeQuery(
      "oso_projectsByCollectionV1",
      collectionQuery,
      collectionSelect,
    )

    mapped += osoProjects.oso_projectsV1.length

    const created = await createOSOProjects(
      osoProjects.oso_projectsV1,
      collections.oso_projectsByCollectionV1,
    )

    totalCreated += created.length

    console.log(
      `Mapped ${Math.min(i + BATCH_SIZE, projectAtlasIds.length)} projects`,
    )
  }

  return { mapped, totalCreated }
})

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

  const { osoId } = projectOSO

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

  const [activeAddresses, gasFees, transactions, tvl] = await Promise.all([
    queryMetrics([osoId], "activeAddresses"),
    queryMetrics([osoId], "gasFees"),
    queryMetrics([osoId], "transactions"),
    queryMetrics([osoId], "tvl"),
  ])

  const activeAddressesPerformance = formatPerformanceMetrics(activeAddresses)
  const gasFeesPerformance = formatPerformanceMetrics(gasFees)
  const transactionsPerformance = formatPerformanceMetrics(transactions)
  const tvlPerformance = formatPerformanceMetrics(tvl)

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
      activeAddresses: formatActiveAddresses(
        formatMetricsData(
          parseMetricsResults(metricsResults, "ACTIVE_ADDRESSES_COUNT"),
        ),
      ),
      gasFees: formatGasFees(
        formatMetricsData(parseMetricsResults(metricsResults, "GAS_FEES")),
      ),
      transactions: formatTransactions(
        formatMetricsData(
          parseMetricsResults(metricsResults, "TRANSACTION_COUNT"),
        ),
      ),
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
      activeAddresses: activeAddressesPerformance,
      gasFees: gasFeesPerformance,
      transactions: transactionsPerformance,
      tvl: tvlPerformance,
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
  const februaryData = activeAddressesCount.filter((p) => p.tranche === 1)
  const marchData = activeAddressesCount.filter((p) => p.tranche === 2)

  const trancheData = {
    [TRANCHE_MONTHS_MAP[1]]: februaryData,
    [TRANCHE_MONTHS_MAP[2]]: marchData,
  }

  const output = formatActiveAddresses(trancheData)

  return output
})

const getGasFees = async function getGasFees(projectId: string) {
  const gasFees = await getProjectGasFees(projectId)
  const februaryData = gasFees.filter((p) => p.tranche === 1)
  const marchData = gasFees.filter((p) => p.tranche === 2)

  const trancheData = {
    [TRANCHE_MONTHS_MAP[1]]: februaryData,
    [TRANCHE_MONTHS_MAP[2]]: marchData,
  }

  const output = formatGasFees(trancheData)

  return output
}

const getTransactions = async function getTransactions(projectId: string) {
  const transactions = await getProjectTransactions(projectId)
  const februaryData = transactions.filter((p) => p.tranche === 1)
  const marchData = transactions.filter((p) => p.tranche === 2)

  const trancheData = {
    [TRANCHE_MONTHS_MAP[1]]: februaryData,
    [TRANCHE_MONTHS_MAP[2]]: marchData,
  }

  const output = formatTransactions(trancheData)

  return output
}

const getTvl = async function getTvl(projectId: string) {
  const tvl = await getProjectTvl(projectId)
  const februaryData = tvl.filter((p) => p.tranche === 1)
  const marchData = tvl.filter((p) => p.tranche === 2)

  const trancheData = {
    [TRANCHE_MONTHS_MAP[1]]: februaryData,
    [TRANCHE_MONTHS_MAP[2]]: marchData,
  }

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
  const februaryData = gasConsumption.filter((p) => p.tranche === 1)
  const marchData = gasConsumption.filter((p) => p.tranche === 2)

  const trancheData = {
    [TRANCHE_MONTHS_MAP[1]]: februaryData,
    [TRANCHE_MONTHS_MAP[2]]: marchData,
  }

  const output = formatGasConsumption(trancheData)

  return output
})

const getTrustedDevelopersCount = cache(
  async function getTrustedDevelopersCount(osoId: string) {
    const trustedDevelopers = await getTrustedDevelopersCountFromOSO(osoId)
    const februaryData = trustedDevelopers.filter((p) => p.tranche === 1)
    const marchData = trustedDevelopers.filter((p) => p.tranche === 2)

    const februaryCountSum = februaryData.reduce((acc, curr) => {
      return acc + Number(curr.value)
    }, 0)

    const marchCountSum = marchData.reduce((acc, curr) => {
      return acc + Number(curr.value)
    }, 0)

    return {
      [TRANCHE_MONTHS_MAP[1]]: februaryCountSum,
      [TRANCHE_MONTHS_MAP[2]]: marchCountSum,
    }
  },
)

const getTopProjects = cache(async (osoId: string) => {
  const topProjects = await getTopProjectsFromOSO(osoId)

  const februaryProjects = topProjects.filter((p) => p.tranche === 1)
  const marchProjects = topProjects.filter((p) => p.tranche === 2)

  return {
    [TRANCHE_MONTHS_MAP[1]]: februaryProjects.slice(0, 6).map((p) => ({
      id: p.targetProject.id,
      name: p.targetProject.name,
      thumbnailUrl: p.targetProject.thumbnailUrl,
      website: p.targetProject.website,
    })),
    [TRANCHE_MONTHS_MAP[2]]: marchProjects.slice(0, 6).map((p) => ({
      id: p.targetProject.id,
      name: p.targetProject.name,
      thumbnailUrl: p.targetProject.thumbnailUrl,
      website: p.targetProject.website,
    })),
  }
})

export async function getDeployedContracts(
  deployer: string,
): Promise<OsoDeployerContractsReturnType> {
  const contracts = await fetch(`/api/oso/contracts/${deployer}`)

  return contracts.json()
}

export async function getParsedDeployedContracts(
  deployer: string,
): Promise<ParsedOsoDeployerContract[]> {
  const contracts = await getDeployedContracts(deployer)
  return parseOsoDeployerContract(contracts)
}

function osoNamespaceToChainId(namespace: string) {
  return supportedMappings[namespace as keyof typeof supportedMappings]
}

export function parseOsoDeployerContract(
  contract: OsoDeployerContractsReturnType | null,
): ParsedOsoDeployerContract[] {
  if (!contract) {
    return []
  }

  // Filter out contracts that are not supported
  return contract.oso_contractsV0
    .filter((c) => osoNamespaceToChainId(c.contractNamespace))
    .map((c) => ({
      contractAddress: c.contractAddress,
      chainId: osoNamespaceToChainId(c.contractNamespace),
      rootDeployerAddress: c.rootDeployerAddress,
    }))
}
