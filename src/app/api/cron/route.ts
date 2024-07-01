import { processKYC } from "@/lib/actions/kyc"

// We process these inline, so use a generous time limit
export const maxDuration = 300

/**
 * Endpoint called by a cron job, to be used for any recurring task
 */
export async function GET() {
  // Triggers a fetch and import of PGF KYC data

  const response = await fetch(
    "https://raw.githubusercontent.com/akathm/hippos/master/rpgf_status.csv",
    {
      cache: "no-store",
    },
  )

  const content = await response.text()

  const entries = content.split("\n").slice(1) // Skip the header row
  await processKYC(entries)

  return Response.json({ status: "ok" })
}
