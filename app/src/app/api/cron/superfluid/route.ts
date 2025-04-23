import { NextRequest } from "next/server"

import { processSuperfluidStream } from "@/lib/actions/rewards"
import { getStreamsForRound } from "@/lib/superfluid"

export const maxDuration = 900
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
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
