"server-only"

import { cache } from "react"
import { gql, GraphQLClient } from "graphql-request"

import {
  createOSOProjects,
  getDevToolingApplication,
  getOnchainBuilderApplication,
  getProjectActiveAddressesCount,
  getProjectGasFees,
  getProjectOSORelatedProjects,
  getProjectsOSO,
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
import {
  formatActiveAddresses,
  formatDevToolingEligibility,
  formatDevToolingReward,
  formatGasFees,
  formatPerformanceMetrics,
  formatOnchainBuilderEligibility,
  formatOnchainBuilderReward,
  formatTransactions,
  formatTvl,
  formatGasConsumption,
} from "./utils"

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
) {
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
    devToolingApplication,
    onchainBuilderApplication,
    devToolingEligibility,
    onchainBuilderEligibility,
    devToolingMetrics,
    onchainBuilderMetrics,
    hasDefillamaAdapter,
  ] = await Promise.all([
    getDevToolingApplication(projectId),
    getOnchainBuilderApplication(projectId),
    getDevToolingEligibility(osoId),
    getOnchainBuilderEligibility(osoId),
    getDevToolingMetrics(projectId),
    getOnchainBuilderMetrics(projectId),
    getHasDefillamaAdapter(osoId),
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
      devToolingApplication,
      onchainBuilderApplication,
      devToolingEligibility,
      onchainBuilderEligibility,
      hasDefillamaAdapter,
    },
    onchainBuilderMetrics,
    devToolingMetrics,
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

const getTransactions = async function getTransactions(osoId: string) {
  const data = await queryMetrics([osoId], "transactions")
  return formatTransactions(data)
}

const getTvl = async function getTvl(osoId: string) {
  const data = await queryMetrics([osoId], "tvl")
  return formatTvl(data)
}

const getOnchainBuilderReward = async function getOnchainBuilderReward(
  osoId: string,
) {
  const data = await queryMetrics([osoId], "onchainBuilderReward")
  return formatOnchainBuilderReward(data)
}

const getOnchainBuilderEligibility =
  async function getOnchainBuilderEligibility(osoId: string) {
    const data = await queryMetrics([osoId], "onchainBuilderReward")
    return formatOnchainBuilderEligibility(data)
  }

const getHasDefillamaAdapter = cache(async function getHasDefillamaAdapter(
  osoId: string,
) {
  const query: QueryOso_ArtifactsByProjectV1Args = {
    where: {
      projectId: { _eq: osoId },
      artifactSource: { _eq: "DEFILLAMA" },
    },
  }

  const select: (keyof Oso_ArtifactsByProjectV1)[] = [
    "artifactId",
    "artifactSource",
  ]

  const data = await osoGqlClient.executeQuery(
    "oso_artifactsByProjectV1",
    query,
    select,
  )

  return data.oso_artifactsByProjectV1.length > 0
})

// Dev Tooling Metrics
const getDevToolingMetrics = cache(async function getDevToolingMetrics(
  projectId: string,
) {
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

const getGasConsumption = async function getGasConsumption(projectId: string) {
  const relatedProjects = await getProjectOSORelatedProjects(projectId)
  const februaryProjects = relatedProjects.filter((p) => p.tranche === 1)
  const marchProjects = relatedProjects.filter((p) => p.tranche === 2)

  const februaryData = await queryMetrics(
    februaryProjects.map((p) => p.osoId),
    "gasFees",
    {
      _gte: OSO_QUERY_TRANCHE_CUTOFF_DATES[1].start,
      _lte: OSO_QUERY_TRANCHE_CUTOFF_DATES[1].end,
    },
  )
  const marchData = await queryMetrics(
    marchProjects.map((p) => p.osoId),
    "gasFees",
    {
      _gte: OSO_QUERY_TRANCHE_CUTOFF_DATES[2].start,
      _lte: OSO_QUERY_TRANCHE_CUTOFF_DATES[2].end,
    },
  )

  const trancheData = {
    [TRANCHE_MONTHS_MAP[1]]: februaryData,
    [TRANCHE_MONTHS_MAP[2]]: marchData,
  }

  const output = formatGasConsumption(trancheData)

  return output
}

const getTrustedDevelopersCount = cache(
  async function getTrustedDevelopersCount(osoId: string) {
    const trustedDevelopers = await getTrustedDevelopersCountFromOSO(osoId)

    const februaryCount = trustedDevelopers.filter(
      (t) => t.tranche === 1,
    ).length
    const marchCount = trustedDevelopers.filter((t) => t.tranche === 2).length

    return {
      [TRANCHE_MONTHS_MAP[1]]: februaryCount,
      [TRANCHE_MONTHS_MAP[2]]: marchCount,
    }
  },
)

const getTopProjects = cache(async function getTopProjects(osoId: string) {
  const topProjects = await getTopProjectsFromOSO(osoId)

  const februaryProjects = topProjects.filter((p) => p.tranche === 1)
  const marchProjects = topProjects.filter((p) => p.tranche === 2)

  return {
    [TRANCHE_MONTHS_MAP[1]]: februaryProjects.slice(0, 6),
    [TRANCHE_MONTHS_MAP[2]]: marchProjects.slice(0, 6),
  }
})

const getDevToolingReward = async function getDevToolingReward(osoId: string) {
  const data = await queryMetrics([osoId], "devToolingReward")
  return formatDevToolingReward(data)
}

const getDevToolingEligibility = async function getDevToolingEligibility(
  osoId: string,
) {
  const data = await queryMetrics([osoId], "devToolingReward")
  return formatDevToolingEligibility(data)
}

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
