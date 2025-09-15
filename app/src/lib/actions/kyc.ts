"use server"

import { isAfter, parse } from "date-fns"

import { auth } from "@/auth"
import { prisma } from "@/db/client"
import { deleteKycTeam, updateKYCUserStatus } from "@/db/kyc"
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

import { verifyAdminStatus, verifyOrganizationAdmin } from "./utils"

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
  await Promise.all(
    inquiries.map(async (inquiry) => {
      const {
        attributes: {
          "updated-at": updatedAt,
          "reference-id": referenceId,
          status,
        },
      } = inquiry

      const parsedStatus =
        inquiryStatusMap[status as keyof typeof inquiryStatusMap]

      if (!parsedStatus) {
        console.warn(`Unknown inquiry status: ${status}`)
        return
      }

      if (!referenceId) {
        console.warn(
          `Missing the required referecedId for inquiry ${inquiry.id}`,
        )
        return
      }

      await updateKYCUserStatus(
        parsedStatus,
        status,
        new Date(updatedAt),
        referenceId,
        inquiry.attributes["expires-at"]
          ? new Date(inquiry.attributes["expires-at"])
          : null,
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
          "updated-at": updatedAt,
          // The Case.status takes precedence over the Inquiry.status whenever the Inquiriy
          // is associated with a Case.
          status,
        },
        relationships: {
          inquiries: { data: inquiries },
        },
      } = c

      for (const inquiryRef of inquiries) {
        const inquiryId = inquiryRef.id
        if (!inquiryId) {
          console.warn(`Missing inquiry id in case ${c.id}`)
          continue
        }

        const inquiry: PersonaInquiry | null =
          await personaClient.getInquiryById(inquiryId)

        if (!inquiry) {
          console.warn(`Inquiry not found for id ${inquiryId} in case ${c.id}`)
          continue
        }
        if (inquiry.attributes["reference-id"]) {
          const parsedStatus =
            caseStatusMap[status as keyof typeof caseStatusMap]
          // The persona status value of a Case is slightly different from the status value of an Inquiry.
          // Adjust Case statues like "Waiting on UBOs" to Pending for now.
          const personaStatus = mapCaseStatusToPersonaStatus(status)

          await updateKYCUserStatus(
            parsedStatus,
            personaStatus,
            new Date(updatedAt),
            inquiry.attributes["reference-id"],
            inquiry.attributes["expires-at"]
              ? new Date(inquiry.attributes["expires-at"])
              : null,
          )
        }
      }
    }),
  )
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
        updatedAt: teamMember.users.updatedAt,
      }))

      const status = resolveProjectStatus(users) as "PENDING" | "APPROVED" | "project_issue"

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
        updatedAt: teamMember.users.updatedAt,
      }))

      const status = resolveProjectStatus(users) as "PENDING" | "APPROVED" | "project_issue"

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
