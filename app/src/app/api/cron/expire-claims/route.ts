import { NextRequest } from "next/server"

import { expireClaims } from "@/db/rewards"
import { withCronObservability } from "@/lib/cron"

export const maxDuration = 300
export const dynamic = "force-dynamic"
export const revalidate = 0

const MONITOR_SLUG = "cron-expire-claims"

async function handleExpireClaimsCron(request: NextRequest) {
  const result = await expireClaims()

  return Response.json({
    status: "ok",
    message: `Expired ${result.count} claims`,
  })
}

export const GET = withCronObservability(handleExpireClaimsCron, {
  monitorSlug: MONITOR_SLUG,
  requireAuth: true,
})
