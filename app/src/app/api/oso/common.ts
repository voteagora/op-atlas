"server-only"

import { gql, GraphQLClient } from "graphql-request"

import {
  createOSOProjects,
  getDevToolingApplication,
  getOnchainBuilderApplication,
  getProjectOSOData,
  getProjectsOSO,
  getTrustedDevelopersCountFromOSO,
} from "@/db/projects"
import {
  OrderBy,
  Oso_ProjectsByCollectionV1,
  Oso_ProjectsV1,
  Oso_TimeseriesMetricsByProjectV0,
  QueryOso_ProjectsByCollectionV1Args,
  QueryOso_ProjectsV1Args,
  QueryOso_TimeseriesMetricsByProjectV0Args,
  Oso_ArtifactsByProjectV1,
  QueryOso_ArtifactsByProjectV1Args,
} from "@/graphql/__generated__/types"
import { OSO_METRICS } from "@/lib/constants"
import { parseOsoDeployerContract } from "@/lib/oso"
import osoGqlClient from "@/lib/oso-client"
import client from "@/lib/oso-client"
import {
  OsoDeployerContractsReturnType,
  ParsedOsoDeployerContract,
} from "@/lib/types"

import { BATCH_SIZE } from "./constants"
import {
  formatActiveAddresses,
  formatDevToolingEligibility,
  formatDevToolingReward,
  formatGasFees,
  formatOnchainBuilderEligibility,
  formatOnchainBuilderReward,
  formatTransactions,
  formatTvl,
} from "./utils"

export const osoClient = new GraphQLClient(
  "https://www.opensource.observer/api/v1/graphql",
  {
    headers: {
      Authorization: `Bearer ${process.env.OSO_AUTH_TOKEN}`,
    },
  },
)

export async function getDeployedContractsServer(
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
}

export async function getDeployedContractsServerParsed(
  deployer: string,
): Promise<ParsedOsoDeployerContract[]> {
  const contracts = await getDeployedContractsServer(deployer)
  return parseOsoDeployerContract(contracts)
}

// TODO: Remove Old OSO Logic Later
// export async function getPublicProjectOSOData(projectId: string) {
//   if (!projectId) {
//     return {
//       error: "Project not found",
//     }
//   }

//   const projectOSO = await getProjectsOSO({ projectId })
//   if (!projectOSO) {
//     return {
//       error: "Project not found",
//     }
//   }

//   const devTooling = await getDevToolingProjects({
//     projectId,
//   })
//   const isDevTooling = Boolean(devTooling)

//   const onchainBuilder = await getOnchainBuildersProjects({ projectId })
//   const isOnchainBuilder = Boolean(onchainBuilder)

//   const { osoId } = projectOSO

//   const [activeAddresses, gasFees, transactions, tvl] = await Promise.all([
//     await queryMetrics([osoId], "activeAddresses"),
//     await queryMetrics([osoId], "gasFees"),
//     await queryMetrics([osoId], "transactions", {
//       _gte: "2024-10-01",
//       _lte: "2025-07-31",
//     }),
//     await queryMetrics([osoId], "tvl"),
//   ])

//   const groupedMetrics = groupedData({
//     activeAddresses,
//     gasFees,
//     transactions,
//     tvl,
//   })

//   const projectOSOData = await getProjectOSOData({ projectId })

//   const projectIdsForGasConsumption =
//     projectOSOData?.onchainBuildersOSOProjectIds ?? []

//   const projectsGasConsumption = await queryMetrics(
//     projectIdsForGasConsumption,
//     "gasFees",
//     { _gte: "2025-02-01", _lte: "2025-02-28" },
//   )
//   const summedProjectsGasConsumption = projectsGasConsumption.reduce(
//     (acc: number, curr: MetricValues) => {
//       return acc + curr.amount
//     },
//     0,
//   )

//   const groupedProjectOSOData = {
//     ...projectOSOData,
//     projectsGasConsumption: summedProjectsGasConsumption,
//   }

//   return {
//     isOnchainBuilder,
//     isDevTooling,
//     groupedMetrics,
//     projectOSOData: groupedProjectOSOData,
//   }
// }
////////////////////////////////////////////////////

const queryMetrics = async (
  osoId: string[],
  key: keyof typeof OSO_METRICS,
  sampleDate = { _gte: "2025-01-01", _lte: "2025-07-31" },
) => {
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
}

export async function mapOSOProjects(projectAtlasIds: string[]) {
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
}

export async function getProjectMetrics(projectId: string) {
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
    getDevToolingMetrics(osoId),
    getOnchainBuilderMetrics(osoId),
    getHasDefillamaAdapter(osoId),
  ])

  console.log(">>> onchainBuilderMetrics", onchainBuilderMetrics)

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
  }
}

// Onchain Builders Metrics
async function getOnchainBuilderMetrics(osoId: string) {
  const [activeAddresses, gasFees, transactions, tvl, onchainBuilderReward] =
    await Promise.all([
      getActiveAddresses(osoId),
      getGasFees(osoId),
      getTransactions(osoId),
      getTvl(osoId),
      getOnchainBuilderReward(osoId),
    ])

  return {
    activeAddresses,
    gasFees,
    transactions,
    tvl,
    onchainBuilderReward,
  }
}

async function getActiveAddresses(osoId: string) {
  const data = await queryMetrics([osoId], "activeAddresses")
  return formatActiveAddresses(data)
}

async function getGasFees(osoId: string) {
  const data = await queryMetrics([osoId], "gasFees")
  return formatGasFees(data)
}

async function getTransactions(osoId: string) {
  const data = await queryMetrics([osoId], "transactions")
  return formatTransactions(data)
}

async function getTvl(osoId: string) {
  const data = await queryMetrics([osoId], "tvl")
  return formatTvl(data)
}

async function getOnchainBuilderReward(osoId: string) {
  const data = await queryMetrics([osoId], "onchainBuilderReward")
  return formatOnchainBuilderReward(data)
}

async function getOnchainBuilderEligibility(osoId: string) {
  const data = await queryMetrics([osoId], "onchainBuilderReward")
  return formatOnchainBuilderEligibility(data)
}

async function getHasDefillamaAdapter(osoId: string) {
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
}
// End Onchain Builders Metrics

// Dev Tooling Metrics
async function getDevToolingMetrics(osoId: string) {
  const [gasConsumption, trustedDevelopersCount, devToolingReward] =
    await Promise.all([
      getGasConsumption(osoId),
      getTrustedDevelopersCount(osoId),
      getDevToolingReward(osoId),
    ])

  return {
    gasConsumption,
    trustedDevelopersCount,
    devToolingReward,
  }
}

async function getGasConsumption(osoId: string) {
  const data = await queryMetrics([osoId], "gasFees")
  return formatGasFees(data)
}

async function getTrustedDevelopersCount(osoId: string) {
  // TODO: Replace thiw with OSO API call once available
  const count = await getTrustedDevelopersCountFromOSO(osoId)
  //

  return count
}

async function getDevToolingReward(osoId: string) {
  const data = await queryMetrics([osoId], "devToolingReward")
  return formatDevToolingReward(data)
}

async function getDevToolingEligibility(osoId: string) {
  const data = await queryMetrics([osoId], "devToolingReward")
  return formatDevToolingEligibility(data)
}
// End Dev Tooling Metrics
