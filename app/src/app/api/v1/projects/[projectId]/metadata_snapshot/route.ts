import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import {
  getConsolidatedProjectTeam,
  getProject,
  getProjectContracts,
} from "@/db/projects"
import { createProjectSnapshotOnBehalf } from "@/lib/actions/snapshots"
import {
  buildFullProjectMetadata,
  FullProjectMetadataValidator,
} from "@/lib/utils/metadata"
import { authenticateApiUser } from "@/serverAuth"

export const POST = async (
  req: NextRequest,
  route: { params: { projectId: string } },
) => {
  const authResponse = await authenticateApiUser(req)

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 })
  }

  try {
    const { projectId } = route.params
    const { farcasterId, metadata } = await req.json()

    const parsedMetadata = FullProjectMetadataValidator.parse(metadata)

    const { ipfsHash, attestationId } = await createProjectSnapshotOnBehalf(
      {
        ...parsedMetadata,
        github: parsedMetadata.github.map((url) => ({
          url,
          name: null,
          description: null,
        })),
        packages: parsedMetadata.packages.map((url) => ({
          url,
          name: null,
          description: null,
        })),
      },
      projectId,
      z.string().parse(farcasterId),
    )

    return NextResponse.json({ ipfsHash, attestationId, projectId })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify(e), { status: 500 })
  }
}

export const GET = async (
  req: NextRequest,
  route: { params: { projectId: string } },
) => {
  const authResponse = await authenticateApiUser(req)

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 })
  }

  try {
    const { projectId } = route.params

    const [project, team, contracts] = await Promise.all([
      getProject({ id: projectId }),
      getConsolidatedProjectTeam({ projectId }),
      getProjectContracts({ projectId }),
    ])

    if (!project) {
      return new Response("Project not found", { status: 404 })
    }

    const metadata = buildFullProjectMetadata(
      project,
      team,
      contracts?.contracts || [],
    )

    return NextResponse.json({
      metadata,
      projectId,
      projectMetadataId:
        project.snapshots[project.snapshots.length - 1].attestationId,
    })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify(e), { status: 500 })
  }
}
