import { NextResponse } from "next/server"

import { processPersonaCases, processPersonaInquiries } from "@/lib/actions/kyc"
import { getPersonaInquiries } from "@/lib/persona"
import { getPersonaCases } from "@/lib/persona"

export const maxDuration = 600

export async function GET() {
  // 1. Kick off cases pull
  const cases = getPersonaCases()
  const inquiries = getPersonaInquiries()

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

  return NextResponse.json({ message: "Cron job completed" })
}
