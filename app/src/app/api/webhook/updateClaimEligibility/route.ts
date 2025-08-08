import { NextRequest, NextResponse } from "next/server"

import { isProjectBlacklisted } from "@/db/projects"
import { getClaimByRewardId, getReward, updateClaim } from "@/db/rewards"
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

  const claim = await getClaimByRewardId({ rewardId: grant_id })
  if (!claim) {
    throw new Response("Claim not found", { status: 404 })
  }

  // Check if project is blacklisted
  const reward = await getReward({ id: grant_id })
  if (reward) {
    const blacklisted = await isProjectBlacklisted(reward.projectId)
    if (blacklisted) {
      return new Response("Project is blacklisted", { status: 403 })
    }
  }

  const updatedClaim = await updateClaim(grant_id, {
    grantEligibilityUpdatedAt: timestamp,
  })

  return NextResponse.json({ claim: updatedClaim })
}
