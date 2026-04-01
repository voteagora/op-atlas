import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import {
  getConsolidatedProjectTeam,
  getProject,
  getProjectContracts,
} from "@/db/projects"
import { createProjectSnapshotOnBehalf } from "@/lib/actions/snapshots"
import { MIRADOR_FLOW } from "@/lib/mirador/constants"
import { appendServerTraceEvent } from "@/lib/mirador/serverTrace"
import { getMiradorTraceContextFromHeaders } from "@/lib/mirador/requestContext"
import {
  buildFullProjectMetadata,
  FullProjectMetadataValidator,
} from "@/lib/utils/metadata"
import { API_USER_SCOPE, authenticateApiUser } from "@/serverAuth"

export const POST = async (
  req: NextRequest,
  route: { params: { projectId: string } },
) => {
  const authResponse = await authenticateApiUser(req, {
    requiredScopes: [API_USER_SCOPE.projectMetadataWrite],
  })
  const traceContext = getMiradorTraceContextFromHeaders(req)
  const resolvedTraceContext = traceContext
    ? {
        ...traceContext,
        flow: traceContext.flow ?? MIRADOR_FLOW.projectPublish,
      }
    : undefined

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, {
      status: authResponse.status ?? 401,
    })
  }

  try {
    const { projectId } = route.params
    const { farcasterId, metadata } = await req.json()

    await appendServerTraceEvent({
      traceContext: {
        ...resolvedTraceContext,
        source: "api",
        step: "metadata_snapshot_post_start",
        projectId,
      },
      eventName: "project_metadata_snapshot_started",
      details: {
        projectId,
        apiUserId: authResponse.userId,
      },
      tags: ["project_publish", "metadata", "api"],
    })

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
        defillamaSlug: parsedMetadata.defillamaSlug ?? [],
      },
      projectId,
      z.string().parse(farcasterId),
      resolvedTraceContext,
    )

    await appendServerTraceEvent({
      traceContext: {
        ...resolvedTraceContext,
        source: "api",
        step: "metadata_snapshot_post_success",
        projectId,
      },
      eventName: "project_metadata_snapshot_succeeded",
      details: {
        projectId,
        ipfsHash,
        attestationId,
      },
      tags: ["project_publish", "metadata", "api"],
    })

    return NextResponse.json({ ipfsHash, attestationId, projectId })
  } catch (e) {
    console.error(e)

    await appendServerTraceEvent({
      traceContext: {
        ...resolvedTraceContext,
        source: "api",
        step: "metadata_snapshot_post_failed",
      },
      eventName: "project_metadata_snapshot_failed",
      details: {
        error: e instanceof Error ? e.message : String(e),
      },
      tags: ["project_publish", "metadata", "api", "error"],
    })

    return new Response(JSON.stringify(e), { status: 500 })
  }
}

export const GET = async (
  req: NextRequest,
  route: { params: { projectId: string } },
) => {
  const authResponse = await authenticateApiUser(req, {
    requiredScopes: [API_USER_SCOPE.projectMetadataRead],
  })

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, {
      status: authResponse.status ?? 401,
    })
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
