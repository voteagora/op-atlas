"use server"

import { isAfter, parse } from "date-fns"
import { isAddress } from "viem"

import { getReward, updateClaim } from "@/db/rewards"

const SUPERFLUID_CLAIM_DATES = [
  "2024-07-12",
  // TODO: Add the rest
]

// Find the next eligible claim date
function getClaimableTimestamp() {
  const now = new Date()
  for (const day of SUPERFLUID_CLAIM_DATES) {
    const parsed = parse(
      day,
      "yyyy-MM-dd",
      new Date("2024-07-01T07:00:00.000Z"),
    )
    if (isAfter(parsed, now)) {
      return parsed
    }
  }

  console.error("No next claimable date found for Superfluid rewards")
  return null
}

/**
 * Expecting a format of:
 * form_id,project_id,grant_id,l2_address,status
 *
 * status can be:
 * - not started
 * - pending
 * - in review
 * - cleared
 * - rejected
 */
export const processKYC = async (entries: string[]) => {
  let counter = 0

  // Skip the header row
  for (const row of entries) {
    const fields = row.split(",")
    if (fields.length !== 5) {
      if (row.trim() !== "") {
        console.error("Invalid KYC row:", row)
      }

      continue
    }

    counter += 1
    const [formId, projectId, rewardId, address, status] = fields

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
    if (
      reward.claim.status === "cleared" ||
      reward.claim.status === "claimed"
    ) {
      console.log(
        `Reward ${rewardId} (project ${projectId}) already through KYC, skipping`,
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

    if (status === "cleared") {
      // Valid, set the claim date
      console.log(`Reward ${rewardId} (project ${projectId}) now claimable`)
      await updateClaim(rewardId, {
        status: "cleared",
        kycStatus: status,
        kycStatusUpdatedAt: new Date(),
        tokenStreamClaimableAt: getClaimableTimestamp(),
      })
    } else {
      // TODO: Just updating status for now, see if further action is needed
      await updateClaim(rewardId, {
        status: status === "rejected" ? "rejected" : "pending",
        kycStatus: status,
        kycStatusUpdatedAt: new Date(),
      })
      console.log(
        `KYC status for reward ${rewardId} (project ${projectId}) now ${status}`,
      )
    }
  }

  console.log(
    `Processed KYC details for ${counter} project${counter === 1 ? "" : "s"}`,
  )
}