import * as Sentry from "@sentry/nextjs"
import { NextRequest } from "next/server"

import { processPersonaCases, processPersonaInquiries } from "@/lib/actions/kyc"
import { getPersonaCases, getPersonaInquiries } from "@/lib/persona"

export const maxDuration = 900
export const dynamic = "force-dynamic"
export const revalidate = 0

const MONITOR_SLUG = "cron-persona-xg"

export async function GET(request: NextRequest) {
  const cases = getPersonaCases()
  const inquiries = getPersonaInquiries()

  const checkInId = Sentry.captureCheckIn({
    monitorSlug: MONITOR_SLUG,
    status: "in_progress",
  })

  try {
    await Promise.all([
      (async () => {
        for await (const batch of cases) {
          // This drops the batch from memory after processing
          await processPersonaCases(batch)
        }
      })(),
      (async () => {
        for await (const batch of inquiries) {
          // This drops the batch from memory after processing
          await processPersonaInquiries(batch)
        }
      })(),
    ])
  } catch (error) {
    Sentry.captureCheckIn({
      checkInId,
      monitorSlug: MONITOR_SLUG,
      status: "error",
    })
    Sentry.captureException(error)

    await Sentry.flush(2000)
  } finally {
    Sentry.captureCheckIn({
      checkInId,
      monitorSlug: MONITOR_SLUG,
      status: "ok",
    })

    await Sentry.flush(2000)
  }

  return Response.json({ status: "Persona cases and inquiries processed" })
}
