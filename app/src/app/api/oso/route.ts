import { NextResponse } from "next/server"
import { formatEther } from "viem"

import {
  Oso_ArtifactsByProjectV1,
  Oso_MetricsV0,
  Oso_ProjectsV1,
  Oso_TimeseriesMetricsByProjectV0,
  QueryOso_ArtifactsByProjectV1Args,
  QueryOso_MetricsV0Args,
  QueryOso_ProjectsV1Args,
  QueryOso_TimeseriesMetricsByProjectV0Args,
} from "@/graphql/__generated__/types"
import { default as client } from "@/lib/oso-client"

export async function POST(req: Request) {
  const { atlasId } = await req.json()

  try {
    // Example 1: Get a project by Atlas ID
    const oso_projectsV1Query: QueryOso_ProjectsV1Args = {
      limit: 1,
      where: { projectName: { _eq: atlasId } },
    }
    const oso_projectsV1Select: (keyof Oso_ProjectsV1)[] = [
      "description",
      "displayName",
      "projectNamespace",
      "projectSource",
      "projectId",
      "projectName",
    ]

    const project = await client.executeQuery(
      "oso_projectsV1",
      oso_projectsV1Query,
      oso_projectsV1Select,
    )

    console.log("Project:", JSON.stringify(project, null, 2))

    // Example 2: Get project artifacts
    const oso_artifactsByProjectV1Query: QueryOso_ArtifactsByProjectV1Args = {
      where: { projectName: { _eq: atlasId } },
    }
    const oso_artifactsByProjectV1Select: (keyof Oso_ArtifactsByProjectV1)[] = [
      "artifactId",
      "artifactName",
      "artifactSource",
    ]
    const artifacts = await client.executeQuery(
      "oso_artifactsByProjectV1",
      oso_artifactsByProjectV1Query,
      oso_artifactsByProjectV1Select,
    )
    console.log("Artifacts:", JSON.stringify(artifacts, null, 2))

    // Example 3: Get metric IDs
    const oso_metricsV0Query: QueryOso_MetricsV0Args = {}
    const oso_metricsV0Select: (keyof Oso_MetricsV0)[] = [
      "metricId",
      "metricName",
    ]
    const metricIds = await client.executeQuery(
      "oso_metricsV0",
      oso_metricsV0Query,
      oso_metricsV0Select,
    )
    console.log("Metric IDs:", JSON.stringify(metricIds, null, 2))

    // Example 4: Get timeseries metrics
    const projectId = "H1DdvseIeFYJUwYwfSNvsXvbgxfwasspZw2MT3Apkfg="
    const oso_timeseriesMetricsByProjectV0Query: QueryOso_TimeseriesMetricsByProjectV0Args =
      {
        where: {
          projectId: { _eq: projectId },
          sampleDate: { _gte: "2025-01-01", _lte: "2025-02-28" },
          metricId: {
            _in: [
              "7PEA33NdLXZ97ichlOnybqpjNAFz84fYFp+Gm7OgGw4=",
              "UtO9UyVu2lYYPzCjiBlIvXGxY+QNVyi+jPHYzVtBoEs=",
              "+5rLhj0Pg2P/g3AVc2Y7Rvqb90r8SMl+wW3gxFUlejE=",
            ],
          },
        },
      }
    const oso_timeseriesMetricsByProjectV0Select: (keyof Oso_TimeseriesMetricsByProjectV0)[] =
      ["metricId", "sampleDate", "amount"]
    const metrics = await client.executeQuery(
      "oso_timeseriesMetricsByProjectV0",
      oso_timeseriesMetricsByProjectV0Query,
      oso_timeseriesMetricsByProjectV0Select,
    )
    console.log("Timeseries Metrics:", JSON.stringify(metrics, null, 2))

    // Example 5: Get gas fees metrics
    const gasFeesQuery: QueryOso_TimeseriesMetricsByProjectV0Args = {
      where: {
        projectId: { _eq: projectId },
        sampleDate: { _gte: "2025-01-01", _lte: "2025-02-28" },
        metricId: {
          _eq: "UtO9UyVu2lYYPzCjiBlIvXGxY+QNVyi+jPHYzVtBoEs=",
        },
      },
    }
    const gasFeesSelect: (keyof Oso_TimeseriesMetricsByProjectV0)[] = [
      "metricId",
      "sampleDate",
      "amount",
    ]
    const gasFees = await client.executeQuery(
      "oso_timeseriesMetricsByProjectV0",
      gasFeesQuery,
      gasFeesSelect,
    )
    console.log("Gas Fees:", JSON.stringify(gasFees, null, 2))
  } catch (error) {
    console.error("Error:", error)
  }

  return NextResponse.json({ atlasId })
}
