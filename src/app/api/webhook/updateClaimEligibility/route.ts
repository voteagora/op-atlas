import { NextRequest, NextResponse } from "next/server"

import { updateEligibilityClaimTimestampToRewardClaim } from "@/lib/actions/rewards"
import { authenticateApiUser } from "@/serverAuth"

export const POST = async (req: NextRequest) => {
  const authResponse = await authenticateApiUser(req)

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 })
  }

  const formData = await req.formData()
  const grant_id = formData.get("grant_id")?.toString()
  const timestamp = new Date().toISOString()

  if (!grant_id) {
    return new Response("grant_id is required", { status: 400 })
  }

  const { error, claim } = await updateEligibilityClaimTimestampToRewardClaim(
    grant_id,
    timestamp,
  )

  if (error) {
    return new Response(error, { status: 500 })
  }
  return NextResponse.json({ claim })
}
