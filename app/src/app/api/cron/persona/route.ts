import { NextRequest } from "next/server"

import { withCronObservability } from "@/lib/cron"
import {
  getAndProcessPersonaCases,
  getAndProcessPersonaInquiries,
} from "@/lib/persona"

export const maxDuration = 800
export const dynamic = "force-dynamic"
export const revalidate = 0

const MONITOR_SLUG = "cron-persona"

async function handlePersonaCron(request: NextRequest) {
  await Promise.all([
    // Since an Inquiry can exist without a Case, we need to process Inquiries first.
    // An Inquiry that is associated with a Case should always take on a Case status.
    getAndProcessPersonaInquiries(),
    getAndProcessPersonaCases(),
  ])

  return Response.json({ status: "Persona cases and inquiries processed" })
}

export const GET = withCronObservability(handlePersonaCron, {
  monitorSlug: MONITOR_SLUG,
  requireAuth: true,
})
