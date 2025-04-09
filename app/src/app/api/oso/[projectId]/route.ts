import { NextResponse } from "next/server"

import { getPublicProjectOSOData } from "../common"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params
  const { groupedMetrics, projectOSOData, error } =
    await getPublicProjectOSOData(projectId)

  if (error) {
    return NextResponse.error()
  }

  return NextResponse.json({
    onchainBuildersMetrics: groupedMetrics,
    projectOSOData: projectOSOData,
  })
}
