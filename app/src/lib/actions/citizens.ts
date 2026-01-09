"use server"

import type { Citizen, PrismaClient } from "@prisma/client"
import {
  deleteCitizen as deleteCitizenRecord,
  getCitizenById,
  getCitizenByType,
  getCitizenCountByType,
  upsertCitizen,
} from "@/db/citizens"
import {
  getAdminOrganizationsWithClient,
  getOrganizationWithClient,
} from "@/db/organizations"
import {
  getProjectWithClient,
  getUserAdminProjectsWithDetailWithClient,
} from "@/db/projects"
import { updateMailchimpTags } from "@/lib/api/mailchimp"
import {
  CITIZEN_ATTESTATION_CODE,
  CITIZEN_TAGS,
  CITIZEN_TYPES,
} from "@/lib/constants"
import {
  createCitizenAttestation,
  revokeCitizenAttestation,
} from "@/lib/eas/serverOnly"
import { getImpersonationContext, withImpersonation } from "@/lib/db/sessionContext"
import { getActiveSeason } from "@/lib/seasons"
import { CitizenLookup, CitizenshipQualification } from "@/lib/types"

interface S8QualifyingUser {
  address: string
}

interface S8QualifyingChain {
  organizationId: string
}

interface S8QualifyingProject {
  projectId: string
}

async function computeS8CitizenshipQualification(
  userId: string,
  db: PrismaClient,
): Promise<CitizenshipQualification | null> {
  if (!userId) {
    return null
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      addresses: true,
      emails: true,
    },
  })

  if (!user) {
    return null
  }

  const [userOrgs, userProjects] = await Promise.all([
    getAdminOrganizationsWithClient(userId, db),
    getUserAdminProjectsWithDetailWithClient({ userId }, db),
  ])

  const orgIds =
    userOrgs?.organizations?.map((org: any) => org.organization.id) || []

  if (orgIds.length > 0) {
    const qualifyingChains = await db.$queryRaw<S8QualifyingChain[]>`
      SELECT * FROM "S8QualifyingChain"
      WHERE "organizationId" = ANY(${orgIds})
    `

    if (qualifyingChains.length > 0) {
      const chainId = qualifyingChains[0].organizationId
      const existingCitizen = await db.citizen.findFirst({
        where: {
          organizationId: chainId,
          attestationId: {
            not: null,
          },
        },
      })

      const organization = await getOrganizationWithClient({ id: chainId }, db)

      if (existingCitizen && organization) {
        return {
          type: CITIZEN_TYPES.chain,
          identifier: organization.id,
          title: organization.name,
          avatar: organization.avatarUrl,
          eligible: false,
          error: `${organization.name} is already registered`,
        }
      }

      if (!existingCitizen && organization) {
        return {
          type: CITIZEN_TYPES.chain,
          identifier: organization.id,
          title: organization.name,
          avatar: organization.avatarUrl,
          eligible: true,
        }
      }
    }
  }

  const projectIds =
    userProjects?.projects?.map(({ project }: any) => project.id) || []

  if (projectIds.length > 0) {
    const qualifyingProjects = await db.$queryRaw<S8QualifyingProject[]>`
      SELECT * FROM "S8QualifyingProject"
      WHERE "projectId" = ANY(${projectIds})
    `

    if (qualifyingProjects.length > 0) {
      const qualifyingIds = qualifyingProjects.map(
        (p: S8QualifyingProject) => p.projectId,
      )
      const projectsWithCitizens = await db.$queryRaw<{ id: string }[]>`
        SELECT p.id
        FROM "Project" p
        INNER JOIN "Citizen" c ON c."projectId" = p.id
        WHERE p.id = ANY(${qualifyingIds})
      `

      const project = await getProjectWithClient(
        { id: qualifyingProjects[0].projectId },
        db,
      )

      if (projectsWithCitizens.length > 0 && project) {
        return {
          type: CITIZEN_TYPES.app,
          identifier: project.id,
          title: project.name,
          avatar: project.thumbnailUrl,
          eligible: false,
          error: `${project.name} is already registered`,
        }
      }

      if (project) {
        return {
          type: CITIZEN_TYPES.app,
          identifier: project.id,
          title: project.name,
          avatar: project.thumbnailUrl,
          eligible: true,
        }
      }
    }
  }

  const existingCitizen = await getCitizenByType(
    {
      type: CITIZEN_TYPES.user,
      id: userId,
    },
    db,
  )

  if (existingCitizen && existingCitizen.attestationId) {
    return {
      type: CITIZEN_TYPES.user,
      identifier: user.id,
      title: "You",
      avatar: user.imageUrl || "",
      eligible: false,
      error: "User already registered",
    }
  }

  const qualifyingAddress = await db.$queryRaw<S8QualifyingUser[]>`
    SELECT * FROM "S8QualifyingUser"
    WHERE address = ANY(${user.addresses.map(
      (addr: { address: string }) => addr.address,
    )})
  `

  if (qualifyingAddress.length > 0) {
    return {
      type: CITIZEN_TYPES.user,
      identifier: user.id,
      title: "You",
      avatar: user.imageUrl || "",
      eligible: true,
    }
  }

  return {
    type: CITIZEN_TYPES.user,
    identifier: user.id,
    title: "You",
    avatar: user.imageUrl || "",
    eligible: false,
    error: "Sorry, you are not eligible to become a Citizen",
  }
}

export const s8CitizenshipQualification = async (
  userId: string,
): Promise<CitizenshipQualification | null> => {
  if (!userId) {
    return null
  }

  return withImpersonation(({ db }) => computeS8CitizenshipQualification(userId, db))
}

// S8 Citizenship Limit Check
export const checkCitizenshipLimit = async (): Promise<boolean> => {
  const citizenCount = await withImpersonation(({ db }) =>
    getCitizenCountByType(CITIZEN_TYPES.user, db),
    { forceProd: true },
  )
  return citizenCount >= 1000
}

export const updateCitizen = async (citizen: {
  type: string
  address: string
  attestationId?: string
  timeCommitment?: string
}) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return {
          error: "Unauthorized",
        }
      }

      try {
        const result = await upsertCitizen(
          {
            id: userId,
            citizen,
          },
          db,
        )

        return result
      } catch (error) {
        console.error("Error updating citizen:", error)
        return {
          error: "Failed to update citizen",
        }
      }
    },
    { requireUser: true },
  )

export const deleteCitizen = async (citizenId: number) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return { error: "Unauthorized" }
      }

      const citizen = await getCitizenById(citizenId, db)

      if (!citizen) {
        return { error: "Citizen not found" }
      }

      if (citizen.userId !== userId) {
        return { error: "Unauthorized" }
      }

      if (citizen.attestationId) {
        try {
          await revokeCitizenAttestation(citizen.attestationId)

          const user = await db.user.findUnique({
            where: { id: userId },
            include: { emails: true },
          })
          const email = user?.emails?.[0]?.email

          if (email) {
            await updateMailchimpTags([{ email, tags: [] }])
          }
        } catch (err) {
          console.error("Failed to revoke attestation:", err)
          return { error: "Failed to revoke attestation" }
        }
      }

      try {
        await deleteCitizenRecord(citizenId, db)
        return { success: true }
      } catch (err) {
        console.error("Failed to delete citizen record:", err)
        return { error: "Failed to delete citizen record" }
      }
    },
    { requireUser: true },
  )

export const getCitizen = async (
  lookup: CitizenLookup,
): Promise<Citizen | null> => {
  return withImpersonation(({ db }) => getCitizenByType(lookup, db))
}

export const attestCitizen = async () =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return {
          error: "Unauthorized",
        }
      }

      // Block S8 registration when Season 9 is active
      const activeSeason = await getActiveSeason()
      if (activeSeason?.id === "9") {
        return {
          error: "Season 8 registration is closed. Please use the Season 9 registration flow.",
        }
      }

      const qualification = await computeS8CitizenshipQualification(
        userId,
        db,
      )

      if (!qualification?.eligible) {
        return {
          error:
            qualification?.error || "You are not eligible to become a Citizen",
        }
      }

      const citizenType =
        CITIZEN_TYPES[qualification.type as keyof typeof CITIZEN_TYPES]
      if (!citizenType) {
        return {
          error: "Invalid citizen type",
        }
      }

      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          addresses: true,
          emails: true,
        },
      })

      if (!user) {
        return {
          error: "User not found",
        }
      }

      const primaryAddress = user.addresses.find(
        (addr: { primary: boolean; address: string }) => addr.primary,
      )?.address

      if (!primaryAddress) {
        return {
          error: "No governance address set",
        }
      }

      try {
        const attestationId = await createCitizenAttestation({
          to: primaryAddress,
          farcasterId: parseInt(user?.farcasterId || "0"),
          selectionMethod:
            CITIZEN_ATTESTATION_CODE[
              citizenType as keyof typeof CITIZEN_ATTESTATION_CODE
            ],
          refUID:
            qualification.type === CITIZEN_TYPES.chain ||
            qualification.type === CITIZEN_TYPES.app
              ? qualification.identifier
              : undefined,
        })

        const isValidAttestationId = /^0x[a-fA-F0-9]{64}$/.test(attestationId)
        if (!isValidAttestationId) {
          return {
            error: "Invalid attestation ID format",
          }
        }

        await upsertCitizen(
          {
            id: userId,
            citizen: {
              address: primaryAddress,
              attestationId,
              type: citizenType,
              projectId:
                qualification.type === CITIZEN_TYPES.app
                  ? qualification.identifier
                  : null,
              organizationId:
                qualification.type === CITIZEN_TYPES.chain
                  ? qualification.identifier
                  : null,
            },
          },
          db,
        )

        const primaryEmail = user.emails[0]?.email
        if (primaryEmail) {
          await updateMailchimpTags([
            {
              email: primaryEmail,
              tags: [CITIZEN_TAGS[citizenType]],
            },
          ])
        }
      } catch (error) {
        console.error("Error attesting citizen:", error)
        return {
          error: "Failed to attest citizen",
        }
      }

      return { success: true }
    },
    { requireUser: true },
  )
