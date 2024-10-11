import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { updateEligibilityClaimTimestampToRewardClaim } from "@/lib/actions/rewards"
import { authenticateApiUser } from "@/serverAuth"

const payloadValidator = z.object({
  rewardId: z.string(),
  timestamp: z.string(),
})

export const POST = async (req: NextRequest) => {
  const authResponse = await authenticateApiUser(req)

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 })
  }

  const { rewardId, timestamp } = payloadValidator.parse(await req.json())

  const { error, claim } = await updateEligibilityClaimTimestampToRewardClaim(
    rewardId,
    timestamp,
  )

  if (error) {
    return new Response(error, { status: 500 })
  }
  return NextResponse.json({ claim })
}
