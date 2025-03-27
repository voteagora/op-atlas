import { gql, GraphQLClient } from "graphql-request"

import { prisma } from "@/db/client"
import {
  OrderBy,
  Oso_TimeseriesMetricsByProjectV0,
  QueryOso_TimeseriesMetricsByProjectV0Args,
} from "@/graphql/__generated__/types"
import { OSO_METRICS } from "@/lib/constants"
import { parseOsoDeployerContract } from "@/lib/oso"
import osoGqlClient from "@/lib/oso-client"
import {
  OsoDeployerContractsReturnType,
  ParsedOsoDeployerContract,
} from "@/lib/types"

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

export async function getPublicProjectOSOData(projectId: string) {
  if (!projectId) {
    return {
      error: "Project not found",
    }
  }

  const projectOSO = await prisma.projectOSO.findMany({
    where: {
      projectId,
    },
    select: {
      osoId: true,
    },
    take: 1,
  })
  if (!projectOSO.at(0)) {
    return {
      error: "Project not found",
    }
  }

  const { osoId } = projectOSO[0]

  const [activeAddresses, gasFees, transactions, tvl] = await Promise.all([
    await queryMetrics(osoId, "activeAddresses"),
    await queryMetrics(osoId, "gasFees"),
    await queryMetrics(osoId, "transactions"),
    await queryMetrics(osoId, "tvl"),
  ])

  const groupedMetrics = groupedData({
    activeAddresses,
    gasFees,
    transactions,
    tvl,
  })

  const projectOSOData = await prisma.projectOSOData.findFirst({
    where: {
      projectId,
    },
    select: {
      data: true,
    },
  })

  return {
    groupedMetrics,
    projectOSOData,
  }
}

const queryMetrics = async (osoId: string, key: keyof typeof OSO_METRICS) => {
  const query: QueryOso_TimeseriesMetricsByProjectV0Args = {
    where: {
      projectId: {
        _eq: osoId,
      },
      metricId: {
        _in: OSO_METRICS[key],
      },
      sampleDate: {
        _gte: "2025-01-01",
        _lte: "2025-07-31",
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

const groupByDate = (metrics: MetricValues[]) => {
  return metrics.reduce<Record<string, number>>((acc, metric) => {
    if (!acc[metric.sampleDate]) {
      acc[metric.sampleDate] = 0
    }
    acc[metric.sampleDate] += metric.amount
    return acc
  }, {})
}

type MetricValues = {
  sampleDate: string
  amount: number
}

const groupedData = (
  data: Record<keyof typeof OSO_METRICS, MetricValues[]>,
) => {
  return {
    activeAddresses: groupByDate(data.activeAddresses),
    gasFees: groupByDate(data.gasFees),
    transactions: groupByDate(data.transactions),
    tvl: groupByDate(data.tvl),
  }
}
