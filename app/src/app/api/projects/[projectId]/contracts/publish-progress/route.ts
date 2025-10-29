import { NextResponse } from "next/server"

import { getProjectContractsFresh } from "@/db/projects"
import { getUnpublishedContractChanges } from "@/lib/actions/projects"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(
  _request: Request,
  { params }: { params: { projectId: string } },
) {
  const { projectId } = params

  try {
    const project = await getProjectContractsFresh({ projectId })
    if (!project) {
      return NextResponse.json({
        verifiedTotal: 0,
        publishedTotal: 0,
        pendingPublish: 0,
        pendingRevoke: 0,
      })
    }

    const diff = await getUnpublishedContractChanges(projectId, project)

    return NextResponse.json({
      verifiedTotal: project.contracts.length,
      publishedTotal: project.publishedContracts.length,
      pendingPublish: diff?.toPublish?.length ?? 0,
      pendingRevoke: diff?.toRevoke?.length ?? 0,
    })
  } catch (error) {
    console.error("Failed to load publish progress", error)
    return NextResponse.json(
      { error: "Failed to load publish progress" },
      { status: 500 },
    )
  }
}
