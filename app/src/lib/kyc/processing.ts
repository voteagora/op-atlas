import "server-only"

import { isAfter, parse } from "date-fns"

import { ensureClaim, getReward, updateClaim } from "@/db/rewards"
import {
  findLegalEntityByPersonaIds,
  updateKYCUserStatus,
  updateLegalEntityStatus,
} from "@/db/kyc"
import {
  caseStatusMap,
  inquiryStatusMap,
  PersonaCase,
  personaClient,
  PersonaInquiry,
} from "@/lib/persona"

const NAME_VALIDATION_CUTOFF = new Date("2026-02-18")

function normalizeForComparison(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase()
}

function namesMatch(
  personaValue: string | null | undefined,
  atlasValue: string | null | undefined,
): boolean {
  return (
    normalizeForComparison(personaValue) === normalizeForComparison(atlasValue)
  )
}

function calculateExpiryDate(
  expiresAt: string | undefined,
  completedAt: string | undefined,
  parsedStatus: string,
  fallbackDate?: Date,
): Date | null {
  if (parsedStatus === "APPROVED" && completedAt) {
    const date = new Date(completedAt)
    date.setFullYear(date.getFullYear() + 1)
    return date
  }

  if (expiresAt) {
    return new Date(expiresAt)
  }

  if (fallbackDate) {
    const date = new Date(fallbackDate)
    date.setFullYear(date.getFullYear() + 1)
    return date
  }

  return null
}

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

export async function processKYC(entries: string[]) {
  let processed = 0
  let updated = 0
  let unchanged = 0
  let skippedNoReward = 0
  let skippedNoClaim = 0
  let createdClaims = 0

  const shouldBackfillMissingClaims =
    (process.env.OP_ATLAS_KYC_BACKFILL_MISSING_CLAIMS || "false")
      .toLowerCase()
      .trim() === "true"

  for (const row of entries) {
    const fields = row.split(",")
    if (fields.length < 5) {
      if (row.trim() !== "") {
        console.error("Invalid KYC row:", row)
      }

      continue
    }

    processed += 1
    const [formId, projectId, rewardId, address, rawStatus] = fields

    const reward = rewardId ? await getReward({ id: rewardId }) : null
    if (!reward) {
      console.warn(
        `Reward ${rewardId} (project ${projectId}) not found, skipping`,
      )
      skippedNoReward += 1
      continue
    }
    if (!reward.claim) {
      if (shouldBackfillMissingClaims) {
        await ensureClaim(rewardId)
        createdClaims += 1
      } else {
        console.warn(
          `No claim found for reward ${rewardId} (project ${projectId}), skipping`,
        )
        skippedNoClaim += 1
        continue
      }
    }

    const status = rawStatus.trim().toLowerCase().replace("_", " ")

    if (reward.claim && status === reward.claim.kycStatus) {
      console.log(
        `KYC status for reward ${rewardId} (project ${projectId}) unchanged: ${status}`,
      )
      unchanged += 1
      continue
    }

    if (status === "cleared") {
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
    updated += 1
  }

  console.log(
    `KYC import: processed=${processed} updated=${updated} unchanged=${unchanged} createdClaims=${createdClaims} skippedNoReward=${skippedNoReward} skippedNoClaim=${skippedNoClaim}`,
  )
}

export async function processPersonaInquiries(inquiries: PersonaInquiry[]) {
  for (const inquiry of inquiries) {
    const {
      attributes: {
        "updated-at": updatedAt,
        "reference-id": referenceId,
        "expires-at": expiresAt,
        "completed-at": completedAt,
        status,
      },
    } = inquiry

    const parsedStatus =
      inquiryStatusMap[status as keyof typeof inquiryStatusMap]

    if (!parsedStatus) {
      console.warn(`Unknown inquiry status: ${status}`)
      continue
    }

    if (!referenceId) {
      console.warn(`Missing the required referenceId for inquiry ${inquiry.id}`)
      continue
    }

    const updatedAtDate = new Date(updatedAt)
    const expiryDate = calculateExpiryDate(
      expiresAt,
      completedAt,
      parsedStatus,
      updatedAtDate,
    )

    if (parsedStatus === "APPROVED" && !completedAt) {
      console.warn(
        `Approved inquiry ${inquiry.id} is missing completed-at timestamp`,
      )
    }

    try {
      await updateKYCUserStatus({
        parsedStatus,
        personaStatus: status,
        updatedAt: updatedAtDate,
        inquiryId: inquiry.id,
        referenceId,
        expiresAt: expiryDate,
      })
    } catch (error) {
      console.error(
        `Failed to update KYC user for inquiry ${inquiry.id}`,
        error,
      )
    }
  }
}

export async function processPersonaCases(cases: PersonaCase[]) {
  for (const personaCase of cases) {
    const caseFields = personaCase.attributes?.fields ?? {}
    if (Object.keys(caseFields).length === 0) {
      console.warn(`No fields found for case ${personaCase.id}`)
      continue
    }

    const {
      attributes: {
        "updated-at": updatedAt,
        "reference-id": caseReferenceId,
        status,
      },
      relationships: {
        inquiries: { data: inquiries },
      },
    } = personaCase

    const parsedStatus = caseStatusMap[status as keyof typeof caseStatusMap]

    if (!parsedStatus) {
      console.warn(`Unknown case status: ${status} for case ${personaCase.id}`)
      continue
    }

    if (!caseReferenceId) {
      console.warn(`Missing case reference id for case ${personaCase.id}`)
    }

    const updatedAtDate = new Date(updatedAt)

    for (const inquiryRef of inquiries) {
      const inquiryId = inquiryRef.id
      if (!inquiryId) {
        console.warn(`Missing inquiry id in case ${personaCase.id}`)
        continue
      }

      try {
        const inquiry = await personaClient.getInquiryById(inquiryId)

        if (!inquiry) {
          console.warn(
            `Inquiry not found for id ${inquiryId} in case ${personaCase.id}`,
          )
          continue
        }

        const inquiryReferenceId =
          inquiry.attributes["reference-id"] || caseReferenceId

        if (!inquiryReferenceId) {
          console.warn(
            `Missing reference id for inquiry ${inquiryId} in case ${personaCase.id}`,
          )
          continue
        }

        const completedAt = inquiry.attributes["completed-at"]
        const expiryDate = calculateExpiryDate(
          inquiry.attributes["expires-at"],
          completedAt,
          parsedStatus,
          updatedAtDate,
        )

        if (parsedStatus === "APPROVED" && !completedAt) {
          console.warn(
            `Approved case ${personaCase.id} inquiry ${inquiryId} missing completed-at timestamp`,
          )
        }

        let effectiveCaseStatus: string = parsedStatus

        if (parsedStatus === "APPROVED") {
          try {
            const legalEntity = await findLegalEntityByPersonaIds(
              inquiryId,
              inquiryReferenceId,
            )
            if (
              legalEntity &&
              legalEntity.createdAt >= NAME_VALIDATION_CUTOFF
            ) {
              const personaBusinessName = caseFields["business-name"]?.value
              const businessNameMatch = namesMatch(
                personaBusinessName,
                legalEntity.name,
              )

              if (!businessNameMatch) {
                console.warn(
                  `Business name mismatch for case ${personaCase.id} inquiry ${inquiryId}: ` +
                    `Persona="${personaBusinessName}" Atlas="${legalEntity.name}". Setting PENDING_REVIEW.`,
                )
                effectiveCaseStatus = "PENDING_REVIEW"
              }
            }
          } catch (error) {
            console.error(
              `Failed to validate business name for case ${personaCase.id}, proceeding with APPROVED`,
              error,
            )
          }
        }

        const updatedEntities = await updateLegalEntityStatus({
          parsedStatus: effectiveCaseStatus,
          updatedAt: updatedAtDate,
          inquiryId,
          referenceId: inquiryReferenceId,
          expiresAt: expiryDate,
        })

        if (updatedEntities.length === 0) {
          console.log(
            `No KYCLegalEntity matched inquiry ${inquiryId} with reference ${inquiryReferenceId} in case ${personaCase.id}`,
          )
        }
      } catch (error) {
        console.error(
          `Failed to update legal entity for inquiry ${inquiryId} in case ${personaCase.id}`,
          error,
        )
      }
    }
  }
}
