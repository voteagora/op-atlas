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

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

async function handlePersonaCron(request: NextRequest) {
  const failures: string[] = []
  try {
    // Since an Inquiry can exist without a Case, process inquiries first
    // so case processing can reuse warmed inquiry cache data.
    await getAndProcessPersonaInquiries()
  } catch (error) {
    failures.push(`inquiries: ${formatError(error)}`)
  }

  try {
    await getAndProcessPersonaCases()
  } catch (error) {
    failures.push(`cases: ${formatError(error)}`)
  }

  if (failures.length > 0) {
    throw new Error(`Persona cron sync failed - ${failures.join(" | ")}`)
  }

  return Response.json({ status: "Persona cases and inquiries processed" })
}

export const GET = withCronObservability(handlePersonaCron, {
  monitorSlug: MONITOR_SLUG,
  requireAuth: true,
})
