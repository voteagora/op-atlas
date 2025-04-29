import { NextRequest } from "next/server"

import { processSuperfluidStream } from "@/lib/actions/rewards"
import { withCronObservability } from "@/lib/cron"
import { getStreamsForRound } from "@/lib/superfluid"

export const maxDuration = 900
export const dynamic = "force-dynamic"
export const revalidate = 0

const MONITOR_SLUG = "cron-superfluid"

async function handleSuperfluidCron(request: NextRequest) {
  await Promise.all([
    (async () => {
      const streams = await getStreamsForRound(7)
      for await (const stream of streams) {
        await processSuperfluidStream(stream, "7")
      }
    })(),
    (async () => {
      const streams = await getStreamsForRound(8)
      for await (const stream of streams) {
        await processSuperfluidStream(stream, "8")
      }
    })(),
  ])

  return Response.json({ status: "Superfluid streams processed" })
}

export const GET = withCronObservability(handleSuperfluidCron, {
  monitorSlug: MONITOR_SLUG,
  requireAuth: true,
})
