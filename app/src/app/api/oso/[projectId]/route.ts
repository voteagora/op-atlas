import { NextResponse } from "next/server"

import { getProjectMetrics } from "../common"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params
  // const { groupedMetrics, projectOSOData, error } =
  //   await getPublicProjectOSOData(projectId)
  const { error, eligibility, onchainBuilderMetrics, devToolingMetrics } =
    await getProjectMetrics(projectId)

  if (error) {
    return NextResponse.error()
  }

  return NextResponse.json({
    eligibility,
    onchainBuilderMetrics,
    devToolingMetrics,
    // projectOSOData: projectOSOData,
  })
}
