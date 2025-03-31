"use server"

import { isAfter, parse } from "date-fns"

import { updateKYBUserStatus, updateKYCUserStatus } from "@/db/kyc"
import { getReward, updateClaim } from "@/db/rewards"
import {
  caseStatusMap,
  inquiryStatusMap,
  PersonaCase,
  PersonaInquiry,
} from "@/lib/persona"

const SUPERFLUID_CLAIM_DATES = [
  "2024-08-05",
  "2024-09-04",
  "2024-10-03",
  "2024-11-05",
  "2024-12-04",
  "2025-01-07",
  "2025-02-05",
  "2025-03-05",
  "2025-04-03",
  "2025-05-06",
  "2025-06-04",
  "2025-07-03",
  "2025-08-05",
  "2025-09-04",
  "2025-10-03",
  "2025-11-05",
  "2025-12-04",
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
 * - delivered
 */
export const processKYC = async (entries: string[]) => {
  let counter = 0

  for (const row of entries) {
    const fields = row.split(",")
    if (fields.length < 5) {
      if (row.trim() !== "") {
        console.error("Invalid KYC row:", row)
      }

      continue
    }

    counter += 1
    const [formId, projectId, rewardId, address, rawStatus] = fields

    const reward = rewardId ? await getReward({ id: rewardId }) : null
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

    const status = rawStatus.trim().toLowerCase().replace("_", " ")

    if (status === reward.claim.kycStatus) {
      console.log(
        `KYC status for reward ${rewardId} (project ${projectId}) unchanged: ${status}`,
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
      let internalStatus = "pending"
      if (status === "rejected") {
        internalStatus = "rejected"
      } else if (status === "delivered") {
        internalStatus = "claimed"
      }

      await updateClaim(rewardId, {
        status: internalStatus,
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

export const processPersonaInquiries = async (inquiries: PersonaInquiry[]) => {
  await Promise.all(
    inquiries.map(async (inquiry) => {
      const {
        attributes: {
          "email-address": email,
          "name-first": firstName,
          "name-last": lastName,
          "updated-at": updatedAt,
          status,
        },
      } = inquiry

      const parsedStatus =
        inquiryStatusMap[status as keyof typeof inquiryStatusMap]

      if (!parsedStatus) {
        console.warn(`Unknown inquiry status: ${status}`)
        return
      }

      if (!email || !firstName || !lastName) {
        console.warn(`Missing required fields for inquiry ${inquiry.id}`)
        return
      }

      await updateKYCUserStatus(
        `${firstName.split(" ")[0]} ${lastName}`,
        email,
        parsedStatus,
        new Date(updatedAt),
      )
    }),
  )
}

export const processPersonaCases = async (cases: PersonaCase[]) => {
  await Promise.all(
    cases.map(async (c) => {
      if (Object.keys(c.attributes.fields).length === 0) {
        console.warn(`No fields found for case ${c.id}`)
        return
      }

      const {
        attributes: {
          fields: {
            "form-filler-email-address": { value: email },
            "business-name": { value: businessName },
          },
          "updated-at": updatedAt,
          status,
        },
      } = c

      if (!email || !businessName) {
        console.warn(`Missing required fields for case ${c.id}`)
        return
      }

      const parsedStatus = caseStatusMap[status as keyof typeof caseStatusMap]

      if (!parsedStatus) {
        console.warn(`Unknown case status: ${status}`)
        return
      }

      await updateKYBUserStatus(
        businessName,
        email,
        parsedStatus,
        new Date(updatedAt),
      )
    }),
  )
}
