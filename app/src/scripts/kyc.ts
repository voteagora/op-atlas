import { readFile } from "fs/promises"

import { processKYC } from "@/lib/actions/kyc"

// This script is used to update the KYC status of claims based on the KYC data for Round 4-6
// It's the alternative to the cron job that runs daily /src/app/api/cron/kyc/route.ts

const CSV_PATH = "kyc.csv"

async function updateClaims() {
  const file = await readFile(CSV_PATH)
  const entries = file.toString().split("\n").slice(1) // Skip the header row

  return await processKYC(entries)
}

console.log("Updating claims...")

updateClaims()
  .then(() => {
    console.log("Done")
  })
  .catch((error) => {
    console.error("Error updating claims with KYC data:", error)
  })
