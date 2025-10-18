"use server"

import { isAfter, parse } from "date-fns"

import { auth } from "@/auth"
import { prisma } from "@/db/client"
import {
  deleteKycTeam,
  updateKYCUserStatus,
  getUserKycTeamSources,
  updateLegalEntityStatus,
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
import { resolveProjectStatus } from "@/lib/utils/kyc"
import { UserKYCTeam } from "@/lib/types"
import { KYCStatus } from "@prisma/client"

import { verifyAdminStatus, verifyOrganizationAdmin } from "./utils"

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

        const updatedEntities = await updateLegalEntityStatus({
          parsedStatus,
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
}) => {
  const session = await auth()

  const userId = session?.user?.id
  if (!userId) {
    throw new Error("Unauthorized")
  }

  if (projectId) {
    const isInvalid = await verifyAdminStatus(projectId, userId)
    if (isInvalid?.error) {
      throw new Error(isInvalid.error)
    }
  } else if (organizationId) {
    const isInvalid = await verifyOrganizationAdmin(
      organizationId,
      session.user.id,
    )
    if (isInvalid?.error) {
      throw new Error(isInvalid.error)
    }
  } else {
    throw new Error("No project or organization provided")
  }

  return await deleteKycTeam({
    kycTeamId,
    hasActiveStream,
  })
}

export const getKYCUsersByProjectId = async (projectId: string) => {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const isInvalid = await verifyAdminStatus(projectId, userId)
  if (isInvalid?.error) {
    throw new Error(isInvalid.error)
  }

  return await getKYCUsersByProjId({ projectId })
}

export async function getUserKycTeams(userId: string): Promise<UserKYCTeam[]> {
  // Fetch user's admin projects with KYC teams
  const adminProjects = await prisma.project.findMany({
    where: {
      team: {
        some: {
          userId,
          role: "admin",
        },
      },
      kycTeamId: {
        not: null,
      },
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      kycTeam: {
        include: {
          team: {
            include: {
              users: true,
            },
          },
        },
      },
    },
  })

  // Fetch user's admin organizations with KYC teams
  const adminOrganizations = await prisma.organization.findMany({
    where: {
      team: {
        some: {
          userId,
          role: "admin",
        },
      },
      OrganizationKYCTeams: {
        some: {
          deletedAt: null,
        },
      },
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      OrganizationKYCTeams: {
        where: {
          deletedAt: null,
        },
        include: {
          team: {
            include: {
              team: {
                include: {
                  users: true,
                },
              },
            },
          },
        },
      },
    },
  })

  const kycTeams: UserKYCTeam[] = []

  // Process project KYC teams
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

  // Process organization KYC teams
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
}

export async function getExistingLegalEntities(kycTeamId: string) {
  try {
    if (!kycTeamId) {
      console.warn("getExistingLegalEntities: missing kycTeamId")
      return []
    }

    console.debug("getExistingLegalEntities:start", { kycTeamId })

    const links = await prisma.kYCLegalEntityTeams.findMany({
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

// Fetch distinct, approved, unexpired legal entities associated with any KYCTeam
// linked to the given organization (to populate reusable entities list).
export async function getAvailableLegalEntitiesForOrganization(
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
    const orgTeams = await prisma.organizationKYCTeam.findMany({
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
    const links = await prisma.kYCLegalEntityTeams.findMany({
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
        (e) => e.status !== KYCStatus.REJECTED && (!e.expiry || e.expiry > now),
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

// Fetch all selected legal entities for a KYCTeam, regardless of approval/expiry,
// to drive the Legal Entities status list in the KYC status UI.
export async function getSelectedLegalEntitiesForTeam(kycTeamId: string) {
  try {
    if (!kycTeamId) return []

    const links = await prisma.kYCLegalEntityTeams.findMany({
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
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  // Verify admin status
  if (projectId) {
    const isInvalid = await verifyAdminStatus(projectId, session.user.id)
    if (isInvalid?.error) return isInvalid
  } else if (organizationId) {
    const isInvalid = await verifyOrganizationAdmin(organizationId, session.user.id)
    if (isInvalid?.error) return isInvalid
  } else {
    return { error: "Project or organization ID required" }
  }

  try {
    // Fetch expired KYCUser
    const oldUser = await prisma.kYCUser.findUnique({
      where: { id: kycUserId },
      include: { KYCUserTeams: true, UserKYCUsers: true }
    })

    if (!oldUser) {
      return { error: "KYC user not found" }
    }

    // Verify actually expired
    if (!oldUser.expiry || oldUser.expiry > new Date()) {
      return { error: "KYC user is not expired" }
    }

    // Create new user and relink in transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const created = await tx.kYCUser.create({
        data: {
          email: oldUser.email,
          firstName: oldUser.firstName,
          lastName: oldUser.lastName,
          status: "PENDING",
          expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        }
      })

      // Link new user to KYC team
      await tx.kYCUserTeams.create({
        data: {
          kycUserId: created.id,
          kycTeamId,
        }
      })

      // Unlink old user from team
      await tx.kYCUserTeams.deleteMany({
        where: {
          kycUserId: oldUser.id,
          kycTeamId,
        }
      })

      // Copy UserKYCUser links if any
      if (oldUser.UserKYCUsers.length > 0) {
        await tx.userKYCUser.createMany({
          data: oldUser.UserKYCUsers.map(link => ({
            userId: link.userId,
            kycUserId: created.id,
          })),
          skipDuplicates: true,
        })
      }

      return created
    })

    // Send KYC started email
    const { sendKYCStartedEmail } = await import("./emails")
    await sendKYCStartedEmail(newUser)

    // Revalidate paths
    const { revalidatePath } = await import("next/cache")
    if (projectId) {
      revalidatePath(`/projects/${projectId}/grant-address`)
    } else if (organizationId) {
      revalidatePath(`/profile/organizations/${organizationId}/grant-address`)
    }

    return { success: true, user: newUser }
  } catch (error) {
    console.error("Error restarting KYC:", error)
    return { error: "Failed to restart KYC" }
  }
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
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  // Verify admin status
  if (projectId) {
    const isInvalid = await verifyAdminStatus(projectId, session.user.id)
    if (isInvalid?.error) return isInvalid
  } else if (organizationId) {
    const isInvalid = await verifyOrganizationAdmin(organizationId, session.user.id)
    if (isInvalid?.error) return isInvalid
  } else {
    return { error: "Project or organization ID required" }
  }

  try {
    // Fetch expired KYCLegalEntity
    const oldEntity = await prisma.kYCLegalEntity.findUnique({
      where: { id: legalEntityId },
      include: {
        kycLegalEntityController: true,
        teamLinks: true,
      }
    })

    if (!oldEntity) {
      return { error: "Legal entity not found" }
    }

    if (!oldEntity.kycLegalEntityController) {
      return { error: "Legal entity controller not found" }
    }

    // Verify actually expired
    if (!oldEntity.expiry || oldEntity.expiry > new Date()) {
      return { error: "Legal entity is not expired" }
    }

    // Create new entity and relink in transaction
    const newEntity = await prisma.$transaction(async (tx) => {
      // Create new legal entity, reusing the existing controller
      const created = await tx.kYCLegalEntity.create({
        data: {
          name: oldEntity.name,
          status: "PENDING",
          expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          kycLegalEntityControllerId: oldEntity.kycLegalEntityControllerId, // Reuse existing controller
        }
      })

      // Link new entity to KYC team
      await tx.kYCLegalEntityTeams.create({
        data: {
          legalEntityId: created.id,
          kycTeamId,
        }
      })

      // Unlink old entity from team
      await tx.kYCLegalEntityTeams.deleteMany({
        where: {
          legalEntityId: oldEntity.id,
          kycTeamId,
        }
      })

      return created
    })

    // Fetch with controller for email
    const entityWithController = await prisma.kYCLegalEntity.findUnique({
      where: { id: newEntity.id },
      include: { kycLegalEntityController: true }
    })

    // Send KYB started email
    if (entityWithController?.kycLegalEntityController) {
      const { sendKYBStartedEmail } = await import("./emails")
      await sendKYBStartedEmail(entityWithController as any)
    }

    // Revalidate paths
    const { revalidatePath } = await import("next/cache")
    if (projectId) {
      revalidatePath(`/projects/${projectId}/grant-address`)
    } else if (organizationId) {
      revalidatePath(`/profile/organizations/${organizationId}/grant-address`)
    }

    return { success: true, entity: newEntity }
  } catch (error) {
    console.error("Error restarting KYB:", error)
    return { error: "Failed to restart KYB" }
  }
}
