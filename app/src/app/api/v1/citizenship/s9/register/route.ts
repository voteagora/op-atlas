import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { createS9Citizen } from "@/lib/actions/citizenship/createS9Citizen"
import { MIRADOR_FLOW } from "@/lib/mirador/constants"
import { getMiradorTraceContextFromHeaders } from "@/lib/mirador/requestContext"

const RegisterS9CitizenBodySchema = z.object({
  userId: z.string().min(1),
  governanceAddress: z.string().min(1),
  seasonId: z.string().min(1),
  trustBreakdown: z.unknown().optional(),
})

export const POST = async (req: NextRequest) => {
  const session = await auth()
  const effectiveUserId =
    session?.impersonation?.targetUserId ?? session?.user?.id

  if (!effectiveUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const payload = RegisterS9CitizenBodySchema.parse(await req.json())

    if (payload.userId !== effectiveUserId) {
      return NextResponse.json(
        { error: "Forbidden: user does not match authenticated session" },
        { status: 403 },
      )
    }

    const traceContext = getMiradorTraceContextFromHeaders(req)
    const result = await createS9Citizen({
      ...payload,
      traceContext: traceContext
        ? {
            ...traceContext,
            flow: traceContext.flow ?? MIRADOR_FLOW.citizenS9Registration,
          }
        : undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to register S9 citizen via API", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to register S9 citizen",
      },
      { status: 500 },
    )
  }
}
