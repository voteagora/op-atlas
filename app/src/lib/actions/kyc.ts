"use server"

import { isAfter, parse } from "date-fns"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import {
  deleteKycTeam,
  updateKYCUserStatus,
  getUserKycTeamSources,
  updateLegalEntityStatus,
  findLegalEntityByPersonaIds,
} from "@/db/kyc"
import { ensureClaim, getReward, updateClaim } from "@/db/rewards"
import { getKYCUsersByProjectId as getKYCUsersByProjId } from "@/db/kyc"
import {
  caseStatusMap,
  inquiryStatusMap,
  mapCaseStatusToPersonaStatus,
  PersonaCase,
  personaClient,
  PersonaInquiry,
} from "@/lib/persona"
import { withImpersonation } from "@/lib/db/sessionContext"
import { resolveProjectStatus } from "@/lib/utils/kyc"
import { UserKYCTeam } from "@/lib/types"
import { KYCStatus } from "@prisma/client"

import { verifyAdminStatus, verifyOrganizationAdmin } from "./utils"

const NAME_VALIDATION_CUTOFF = new Date("2026-02-18")

function normalizeForComparison(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase()
}

function namesMatch(
  personaValue: string | null | undefined,
  atlasValue: string | null | undefined,
): boolean {
  return normalizeForComparison(personaValue) === normalizeForComparison(atlasValue)
}

/**
 * Calculate KYC/KYB expiry date based on Persona inquiry attributes
 * @param expiresAt - Optional expires-at from Persona inquiry
 * @param completedAt - Optional completed-at from Persona inquiry
 * @param parsedStatus - The KYC status (APPROVED, PENDING, etc)
 * @param fallbackDate - Optional fallback date to use for default calculation
 * @returns Calculated expiry date, or null if no expires-at and not approved
 */
function calculateExpiryDate(
  expiresAt: string | undefined,
  completedAt: string | undefined,
  parsedStatus: string,
  fallbackDate?: Date
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

  // Return null to let SQL handle default (updatedAt + 1 year)
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
        // proceed to update below
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
    updated += 1
  }
  console.log(
    `KYC import: processed=${processed} updated=${updated} unchanged=${unchanged} createdClaims=${createdClaims} skippedNoReward=${skippedNoReward} skippedNoClaim=${skippedNoClaim}`,
  )
}

export const processPersonaInquiries = async (inquiries: PersonaInquiry[]) => {
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
      console.warn(
        `Missing the required referenceId for inquiry ${inquiry.id}`,
      )
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

export const processPersonaCases = async (cases: PersonaCase[]) => {
  for (const personaCase of cases) {
    if (Object.keys(personaCase.attributes.fields).length === 0) {
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

    const parsedStatus =
      caseStatusMap[status as keyof typeof caseStatusMap]

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
            const legalEntity = await findLegalEntityByPersonaIds(inquiryId, inquiryReferenceId)
            if (legalEntity && legalEntity.createdAt >= NAME_VALIDATION_CUTOFF) {
              const personaBusinessName = personaCase.attributes.fields["business-name"]?.value
              const businessNameMatch = namesMatch(personaBusinessName, legalEntity.name)

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

export const deleteKYCTeamAction = async ({
  projectId,
  organizationId,
  kycTeamId,
  hasActiveStream,
}: {
  projectId?: string
  organizationId?: string
  kycTeamId: string
  hasActiveStream?: boolean
}) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      if (projectId) {
        const isInvalid = await verifyAdminStatus(projectId, userId)
        if (isInvalid?.error) {
          throw new Error(isInvalid.error)
        }
      } else if (organizationId) {
        const isInvalid = await verifyOrganizationAdmin(organizationId, userId)
        if (isInvalid?.error) {
          throw new Error(isInvalid.error)
        }
      } else {
        throw new Error("No project or organization provided")
      }

      const result = await deleteKycTeam(
        {
          kycTeamId,
          hasActiveStream,
        },
        db,
      )

      if (projectId) {
        revalidatePath(`/projects/${projectId}/grant-address`)
      }
      if (organizationId) {
        revalidatePath(`/profile/organizations/${organizationId}/grant-address`)
      }

      return result
    },
    { requireUser: true },
  )

export const getKYCUsersByProjectId = async (projectId: string) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      const isInvalid = await verifyAdminStatus(projectId, userId)
      if (isInvalid?.error) {
        throw new Error(isInvalid.error)
      }

      return getKYCUsersByProjId({ projectId }, db)
    },
    { requireUser: true },
  )

export async function getUserKycTeams(
  targetUserId?: string,
): Promise<UserKYCTeam[]> {
  return withImpersonation(async ({ db, userId: sessionUserId }) => {
    const userId = targetUserId ?? sessionUserId
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const { adminProjects, adminOrganizations } =
      await getUserKycTeamSources(userId, db)

    const kycTeams: UserKYCTeam[] = []

    for (const project of adminProjects) {
      if (project.kycTeam) {
        const users = project.kycTeam.team.map((teamMember) => ({
          id: teamMember.users.id,
          status: teamMember.users.status,
          expiry: teamMember.users.expiry,
          updatedAt: teamMember.users.updatedAt,
        }))

        const status = resolveProjectStatus(users) as
          | "PENDING"
          | "APPROVED"
          | "EXPIRED"
          | "project_issue"

        kycTeams.push({
          id: project.kycTeam.id,
          walletAddress: project.kycTeam.walletAddress,
          createdAt: project.kycTeam.createdAt,
          updatedAt: project.kycTeam.updatedAt,
          projectId: project.id,
          projectName: project.name,
          users,
          status,
        })
      }
    }

    for (const organization of adminOrganizations) {
      for (const orgKycTeam of organization.OrganizationKYCTeams) {
        const users = orgKycTeam.team.team.map((teamMember) => ({
          id: teamMember.users.id,
          status: teamMember.users.status,
          expiry: teamMember.users.expiry,
          updatedAt: teamMember.users.updatedAt,
        }))

        const status = resolveProjectStatus(users) as
          | "PENDING"
          | "APPROVED"
          | "EXPIRED"
          | "project_issue"

        kycTeams.push({
          id: orgKycTeam.team.id,
          walletAddress: orgKycTeam.team.walletAddress,
          createdAt: orgKycTeam.team.createdAt,
          updatedAt: orgKycTeam.team.updatedAt,
          organizationId: organization.id,
          organizationName: organization.name,
          users,
          status,
        })
      }
    }

    return kycTeams
  })
}

async function fetchExistingLegalEntities(
  db: PrismaClient,
  kycTeamId: string,
) {
  try {
    if (!kycTeamId) {
      console.warn("getExistingLegalEntities: missing kycTeamId")
      return []
    }

    console.debug("getExistingLegalEntities:start", { kycTeamId })

    const links = await db.kYCLegalEntityTeams.findMany({
      where: { kycTeamId },
      include: {
        legalEntity: {
          include: {
            kycLegalEntityController: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    console.debug("getExistingLegalEntities:linksFetched", {
      count: links.length,
    })

    const now = new Date()

    const mapped = links
      .map((l) => l.legalEntity)
      .filter((e): e is NonNullable<typeof e> => Boolean(e))

    const filtered = mapped.filter(
      (e) => e.status === KYCStatus.APPROVED && (!e.expiry || e.expiry > now),
    )

    if (mapped.length !== filtered.length) {
      const dropped = mapped.length - filtered.length
      console.debug("getExistingLegalEntities:filteredOut", {
        total: mapped.length,
        approvedAndValid: filtered.length,
        dropped,
      })
    }

    const items = filtered.map((e) => ({
      id: e.id,
      businessName: e.name,
      controllerFirstName: e.kycLegalEntityController?.firstName || "",
      controllerLastName: e.kycLegalEntityController?.lastName || "",
      controllerEmail: e.kycLegalEntityController?.email || "",
      expiresAt: e.expiry ?? null,
    }))

    console.debug("getExistingLegalEntities:itemsPrepared", {
      count: items.length,
    })

    return items
  } catch (e) {
    console.error("getExistingLegalEntities error", e)
    return []
  }
}

export async function getExistingLegalEntities(
  kycTeamId: string,
  db?: PrismaClient,
) {
  if (db) {
    return fetchExistingLegalEntities(db, kycTeamId)
  }

  return withImpersonation(({ db }) => fetchExistingLegalEntities(db, kycTeamId))
}

// Fetch distinct, approved, unexpired legal entities associated with any KYCTeam
// linked to the given organization (to populate reusable entities list).
async function fetchAvailableLegalEntitiesForOrganization(
  db: PrismaClient,
  organizationId: string,
) {
  try {
    if (!organizationId) {
      console.warn(
        "getAvailableLegalEntitiesForOrganization: missing organizationId",
      )
      return []
    }
    console.debug("getAvailableLegalEntitiesForOrganization:start", {
      organizationId,
    })

    // 1) Find all KYCTeams linked to this organization
    const orgTeams = await db.organizationKYCTeam.findMany({
      where: { organizationId },
      select: { kycTeamId: true },
    })
    const kycTeamIds = orgTeams.map((t) => t.kycTeamId)
    console.debug("getAvailableLegalEntitiesForOrganization:orgTeamsFetched", {
      teamCount: kycTeamIds.length,
    })

    if (kycTeamIds.length === 0) {
      return []
    }

    // 2) Fetch all links from those teams to legal entities
    const links = await db.kYCLegalEntityTeams.findMany({
      where: { kycTeamId: { in: kycTeamIds } },
      include: {
        legalEntity: {
          include: { kycLegalEntityController: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    console.debug("getAvailableLegalEntitiesForOrganization:linksFetched", {
      count: links.length,
    })

    const now = new Date()

    // 3) Map links to legal entities, filter out rejected + expired, and dedupe by id
    const approvedValid = links
      .map((l) => l.legalEntity)
      .filter((e): e is NonNullable<typeof e> => Boolean(e))
      .filter(
        (e) => e.status !== KYCStatus.REJECTED && e.status !== KYCStatus.PENDING_REVIEW && (!e.expiry || e.expiry > now),
      )

    // Dedupe by id
    const seen = new Set<string>()
    const deduped = approvedValid.filter((e) => {
      if (seen.has(e.id)) return false
      seen.add(e.id)
      return true
    })

    const items = deduped.map((e) => ({
      id: e.id,
      businessName: e.name,
      controllerFirstName: e.kycLegalEntityController?.firstName || "",
      controllerLastName: e.kycLegalEntityController?.lastName || "",
      controllerEmail: e.kycLegalEntityController?.email || "",
      expiresAt: e.expiry ?? null,
    }))

    console.debug("getAvailableLegalEntitiesForOrganization:itemsPrepared", {
      count: items.length,
    })
    return items
  } catch (e) {
    console.error("getAvailableLegalEntitiesForOrganization error", e)
    return []
  }
}

export async function getAvailableLegalEntitiesForOrganization(
  organizationId: string,
  db?: PrismaClient,
) {
  if (db) {
    return fetchAvailableLegalEntitiesForOrganization(db, organizationId)
  }

  return withImpersonation(({ db }) =>
    fetchAvailableLegalEntitiesForOrganization(db, organizationId),
  )
}

// Fetch all selected legal entities for a KYCTeam, regardless of approval/expiry,
// to drive the Legal Entities status list in the KYC status UI.
async function fetchSelectedLegalEntitiesForTeam(
  db: PrismaClient,
  kycTeamId: string,
) {
  try {
    if (!kycTeamId) return []

    const links = await db.kYCLegalEntityTeams.findMany({
      where: { kycTeamId },
      include: {
        legalEntity: {
          include: {
            kycLegalEntityController: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return links
      .map((l) => l.legalEntity)
      .filter((e): e is NonNullable<typeof e> => Boolean(e))
      .map((e) => ({
        id: e.id,
        name: e.name,
        status: e.status,
        expiry: e.expiry ?? null,
        controllerFirstName: e.kycLegalEntityController?.firstName || "",
        controllerLastName: e.kycLegalEntityController?.lastName || "",
        controllerEmail: e.kycLegalEntityController?.email || "",
      }))
  } catch (e) {
    console.error("getSelectedLegalEntitiesForTeam error", e)
    return []
  }
}

export async function getSelectedLegalEntitiesForTeam(
  kycTeamId: string,
  db?: PrismaClient,
) {
  if (db) {
    return fetchSelectedLegalEntitiesForTeam(db, kycTeamId)
  }

  return withImpersonation(({ db }) =>
    fetchSelectedLegalEntitiesForTeam(db, kycTeamId),
  )
}

export async function restartKYCForExpiredUser({
  kycUserId,
  kycTeamId,
  projectId,
  organizationId,
}: {
  kycUserId: string
  kycTeamId: string
  projectId?: string
  organizationId?: string
}) {
  return withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return { error: "Unauthorized" }
      }

      if (projectId) {
        const isInvalid = await verifyAdminStatus(projectId, userId)
        if (isInvalid?.error) return isInvalid
      } else if (organizationId) {
        const isInvalid = await verifyOrganizationAdmin(organizationId, userId)
        if (isInvalid?.error) return isInvalid
      } else {
        return { error: "Project or organization ID required" }
      }

      try {
        const oldUser = await db.kYCUser.findUnique({
          where: { id: kycUserId },
          include: { KYCUserTeams: true, UserKYCUsers: true },
        })

        if (!oldUser) {
          return { error: "KYC user not found" }
        }

        if (!oldUser.expiry || oldUser.expiry > new Date()) {
          return { error: "KYC user is not expired" }
        }

        const newUser = await db.$transaction(async (tx) => {
          const created = await tx.kYCUser.create({
            data: {
              email: oldUser.email,
              firstName: oldUser.firstName,
              lastName: oldUser.lastName,
              status: "PENDING",
              expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          })

          await tx.kYCUserTeams.create({
            data: {
              kycUserId: created.id,
              kycTeamId,
            },
          })

          await tx.kYCUserTeams.deleteMany({
            where: {
              kycUserId: oldUser.id,
              kycTeamId,
            },
          })

          if (oldUser.UserKYCUsers.length > 0) {
            await tx.userKYCUser.createMany({
              data: oldUser.UserKYCUsers.map((link) => ({
                userId: link.userId,
                kycUserId: created.id,
              })),
              skipDuplicates: true,
            })
          }

          return created
        })

        const { sendKYCStartedEmail } = await import("./emails")
        await sendKYCStartedEmail(newUser)

        if (projectId) {
          revalidatePath(`/projects/${projectId}/grant-address`)
        } else if (organizationId) {
          revalidatePath(
            `/profile/organizations/${organizationId}/grant-address`,
          )
        }

        return { success: true, user: newUser }
      } catch (error) {
        console.error("Error restarting KYC:", error)
        return { error: "Failed to restart KYC" }
      }
    },
    { requireUser: true },
  )
}

export async function restartKYCForExpiredLegalEntity({
  legalEntityId,
  kycTeamId,
  projectId,
  organizationId,
}: {
  legalEntityId: string
  kycTeamId: string
  projectId?: string
  organizationId?: string
}) {
  return withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return { error: "Unauthorized" }
      }

      if (projectId) {
        const isInvalid = await verifyAdminStatus(projectId, userId)
        if (isInvalid?.error) return isInvalid
      } else if (organizationId) {
        const isInvalid = await verifyOrganizationAdmin(organizationId, userId)
        if (isInvalid?.error) return isInvalid
      } else {
        return { error: "Project or organization ID required" }
      }

      try {
        const oldEntity = await db.kYCLegalEntity.findUnique({
          where: { id: legalEntityId },
          include: {
            kycLegalEntityController: true,
          },
        })

        if (!oldEntity) {
          return { error: "Legal entity not found" }
        }

        if (!oldEntity.expiry || oldEntity.expiry > new Date()) {
          return { error: "Legal entity is not expired" }
        }

        const newEntity = await db.$transaction(async (tx) => {
          const created = await tx.kYCLegalEntity.create({
            data: {
              name: oldEntity.name,
              status: "PENDING",
              expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              kycLegalEntityController: {
                create: {
                  firstName: oldEntity.kycLegalEntityController?.firstName || "",
                  lastName: oldEntity.kycLegalEntityController?.lastName || "",
                  email:
                    oldEntity.kycLegalEntityController?.email?.toLowerCase() ||
                    "",
                },
              },
            },
          })

          await tx.kYCLegalEntityTeams.create({
            data: {
              kycTeamId,
              legalEntityId: created.id,
            },
          })

          await tx.kYCLegalEntityTeams.deleteMany({
            where: {
              kycTeamId,
              legalEntityId,
            },
          })

          return created
        })

        const { sendKYBStartedEmail } = await import("./emails")
        await sendKYBStartedEmail(newEntity as any)

        if (projectId) {
          revalidatePath(`/projects/${projectId}/grant-address`)
        } else if (organizationId) {
          revalidatePath(`/profile/organizations/${organizationId}/grant-address`)
        }

        return { success: true, legalEntity: newEntity }
      } catch (error) {
        console.error("Error restarting legal entity KYC:", error)
        return { error: "Failed to restart legal entity KYC" }
      }
    },
    { requireUser: true },
  )
}

export async function restartAllExpiredKYCForTeam({
  kycTeamId,
  projectId,
  organizationId,
}: {
  kycTeamId: string
  projectId?: string
  organizationId?: string
}) {
  return withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return { error: "Unauthorized" }
      }

      if (projectId) {
        const isInvalid = await verifyAdminStatus(projectId, userId)
        if (isInvalid?.error) return isInvalid
      } else if (organizationId) {
        const isInvalid = await verifyOrganizationAdmin(organizationId, userId)
        if (isInvalid?.error) return isInvalid
      } else {
        return { error: "Project or organization ID required" }
      }

      try {
        const expiredUsers = await db.kYCUser.findMany({
          where: {
            KYCUserTeams: {
              some: {
                kycTeamId,
              },
            },
            status: "APPROVED",
            expiry: {
              lte: new Date(),
            },
          },
        })

        for (const user of expiredUsers) {
          await restartKYCForExpiredUser({
            kycUserId: user.id,
            kycTeamId,
            projectId,
            organizationId,
          })
        }

        const expiredEntities = await db.kYCLegalEntity.findMany({
          where: {
            teamLinks: {
              some: {
                kycTeamId,
              },
            },
            status: "APPROVED",
            expiry: {
              lte: new Date(),
            },
          },
        })

        for (const entity of expiredEntities) {
          await restartKYCForExpiredLegalEntity({
            legalEntityId: entity.id,
            kycTeamId,
            projectId,
            organizationId,
          })
        }

        if (projectId) {
          revalidatePath(`/projects/${projectId}/grant-address`)
        } else if (organizationId) {
          revalidatePath(`/profile/organizations/${organizationId}/grant-address`)
        }

        return {
          success: true,
          restartedUsers: expiredUsers.length,
          restartedEntities: expiredEntities.length,
        }
      } catch (error) {
        console.error("Error restarting all expired KYC:", error)
        return { error: "Failed to restart expired KYC" }
      }
    },
    { requireUser: true },
  )
}
