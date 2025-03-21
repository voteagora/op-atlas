import { NextRequest } from "next/server"

import { processPersonaCases, processPersonaInquiries } from "@/lib/actions/kyc"
import { getPersonaCases, getPersonaInquiries } from "@/lib/persona"

export async function GET(request: NextRequest) {
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

  return Response.json({ status: "Persona cases and inquiries processed" })
}
