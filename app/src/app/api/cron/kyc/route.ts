import { NextRequest } from "next/server"

import { processKYC } from "@/lib/actions/kyc"
import { withCronObservability } from "@/lib/cron"

// We process these inline, so use a generous time limit
export const maxDuration = 300
export const dynamic = "force-dynamic"
export const revalidate = 0

const MONITOR_SLUG = "cron-kyc"

async function handleKYCCron(request: NextRequest) {
  // Triggers a fetch and import of PGF KYC data
  const response = await fetch(
    "https://raw.githubusercontent.com/voteagora/op-rpgf-r4-6-kyc-status-backfilling/main/rpgf_status.csv",
    {
      cache: "no-store",
    },
  )

  const content = await response.text()

  const entries = content.split("\n").slice(1) // Skip the header row
  await processKYC(entries)

  return Response.json({ status: "ok" })
}

export const GET = withCronObservability(handleKYCCron, {
  monitorSlug: MONITOR_SLUG,
  requireAuth: true,
})
