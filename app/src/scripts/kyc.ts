import { readFile } from "fs/promises"

import { processKYC } from "@/lib/actions/kyc"

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
