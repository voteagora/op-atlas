import { NextResponse } from "next/server"

import { prisma } from "@/db/client"
import {
  OrderBy,
  Oso_MetricsV0,
  Oso_TimeseriesMetricsByProjectV0,
  QueryOso_MetricsV0Args,
  QueryOso_TimeseriesMetricsByProjectV0Args,
} from "@/graphql/__generated__/types"
import { OSO_METRICS } from "@/lib/constants"
import osoClient from "@/lib/oso-client"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params
  if (!projectId) {
    return NextResponse.error()
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
    return NextResponse.error()
  }

  const { osoId } = projectOSO[0]

  const [activeAddresses, gasFees, transactions, tvl] = await Promise.all([
    await queryMetrics(osoId, "activeAddresses"),
    await queryMetrics(osoId, "gasFees"),
    await queryMetrics(osoId, "transactions"),
    await queryMetrics(osoId, "tvl"),
  ])

  const t = {
    activeAddresses: {
      "2025-01-23": 1,
      "2025-02-19": 1,
      "2025-02-21": 4,
    },
    gasFees: {
      "2025-01-23": 1.06709064e-10,
      "2025-02-19": 1.1327449056e-8,
    },
    transactions: {
      "2025-01-23": 4,
      "2025-02-19": 2,
    },
    tvl: { "2025-01-23": 400, "2025-02-19": 299 },
  }

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

  console.log(">>> projectOSOData", projectOSOData?.data)

  return NextResponse.json({
    onchainBuildersMetrics: groupedMetrics,
    projectOSOData: projectOSOData?.data,
  })
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
  const result = await osoClient.executeQuery(
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
