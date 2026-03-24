import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/auth"
import { finalizeProjectSnapshot } from "@/lib/actions/snapshots"
import { MIRADOR_FLOW } from "@/lib/mirador/constants"
import { getMiradorTraceContextFromHeaders } from "@/lib/mirador/requestContext"

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
    const traceContext = getMiradorTraceContextFromHeaders(req)
    const result = await finalizeProjectSnapshot(
      params.projectId,
      traceContext
        ? {
            ...traceContext,
            flow: traceContext.flow ?? MIRADOR_FLOW.projectPublish,
          }
        : undefined,
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to finalize project snapshot via API", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to finalize project snapshot",
      },
      { status: 500 },
    )
  }
}
