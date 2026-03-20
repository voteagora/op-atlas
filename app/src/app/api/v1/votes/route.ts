import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { vote } from "@/lib/actions/votes"
import { MIRADOR_FLOW } from "@/lib/mirador/constants"
import { getMiradorTraceContextFromHeaders } from "@/lib/mirador/requestContext"

const VoteBodySchema = z.object({
  data: z.string().min(1),
  delegateAttestationSignature: z.object({
    r: z.string(),
    s: z.string(),
    v: z.number(),
  }),
  signerAddress: z.string().min(1),
  citizenRefUID: z.string().min(1),
})

export const POST = async (req: NextRequest) => {
  const session = await auth()
  const effectiveUserId =
    session?.impersonation?.targetUserId ?? session?.user?.id

  if (!effectiveUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const payload = VoteBodySchema.parse(await req.json())
    const traceContext = getMiradorTraceContextFromHeaders(req)

    const attestationId = await vote(
      payload.data,
      payload.delegateAttestationSignature,
      payload.signerAddress,
      payload.citizenRefUID,
      traceContext
        ? {
            ...traceContext,
            flow: traceContext.flow ?? MIRADOR_FLOW.governanceVote,
          }
        : undefined,
    )

    return NextResponse.json({ attestationId })
  } catch (error) {
    console.error("Failed to submit vote via API", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to submit vote",
      },
      { status: 500 },
    )
  }
}
