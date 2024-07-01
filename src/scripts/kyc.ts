import { readFile } from "fs/promises"
import { isAddress } from "viem"

import { getReward, updateClaim } from "@/db/rewards"

const CSV_PATH = "kyc.csv"

// const CSV_URL = https://raw.githubusercontent.com/akathm/hippos/master/rpgf_status.csv

/**
 * Expecting a format of:
 * form_id,project_id,grant_id,l2_address,status
 *
 * status can be:
 * - not started
 * - cleared
 */

async function processKYC(entries: string[]) {
  let counter = 0

  // Skip the header row
  for (const row of entries.slice(1)) {
    const fields = row.split(",")
    if (fields.length !== 5) {
      if (row.trim() !== "") {
        console.error("Invalid KYC row:", row)
      }

      continue
    }

    counter += 1
    const [formId, projectId, rewardId, address, status] = fields

    // TODO: Get final status list and see if other action is needed
    if (status !== "cleared") {
      console.log(
        `Skipping reward ${rewardId} (project ${projectId}) - KYC not ready`,
      )
      continue
    }

    const reward = await getReward({ id: rewardId })
    if (!reward) {
      console.warn(
        `Reward ${rewardId} (project ${projectId}) not found, skipping`,
      )
      continue
    }
    if (!reward.claim) {
      console.warn(
        `No claim found for reward ${rewardId} (project ${projectId}), skipping`,
      )
      continue
    }

    // TODO: Do we need to take action on address mismatch?
    if (
      !isAddress(address) ||
      reward.claim.address?.toLowerCase() !== address.toLowerCase()
    ) {
      console.warn(
        `Address mismatch for reward ${rewardId} (address ${address}), skipping`,
      )
      continue
    }

    // Valid, update the status
    await updateClaim({ rewardId, status: "cleared" })
    console.log(
      `Updated KYC status for reward ${rewardId} (project ${projectId})`,
    )

    // TODO: Set the date at which the superfluid stream is claimable
  }

  console.log(
    `Processed KYC details for ${counter} project${counter === 1 ? "" : "s"}`,
  )
}

async function updateClaims() {
  const file = await readFile(CSV_PATH)
  const entries = file.toString().split("\n")

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
