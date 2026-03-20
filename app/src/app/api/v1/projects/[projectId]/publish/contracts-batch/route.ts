import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { publishProjectContractsBatch } from "@/lib/actions/snapshots"
import { MIRADOR_FLOW } from "@/lib/mirador/constants"
import { getMiradorTraceContextFromHeaders } from "@/lib/mirador/requestContext"

const PublishBatchBodySchema = z.object({
  batchSize: z.number().int().positive().optional(),
})

export const POST = async (
  req: NextRequest,
  { params }: { params: { projectId: string } },
) => {
  const session = await auth()
  const effectiveUserId =
    session?.impersonation?.targetUserId ?? session?.user?.id

  if (!effectiveUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = PublishBatchBodySchema.parse(await req.json())
    const traceContext = getMiradorTraceContextFromHeaders(req)

    const result = await publishProjectContractsBatch({
      projectId: params.projectId,
      batchSize: body.batchSize,
      traceContext: traceContext
        ? {
            ...traceContext,
            flow: traceContext.flow ?? MIRADOR_FLOW.projectPublish,
          }
        : undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to publish project contracts batch via API", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to publish project contracts batch",
      },
      { status: 500 },
    )
  }
}
