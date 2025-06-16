"use server"

import { Citizen } from "@prisma/client"

import { auth } from "@/auth"
import {
  getCitizenByType,
  getCitizenCountByType,
  upsertCitizen,
} from "@/db/citizens"
import { prisma } from "@/db/client"
import { getAdminOrganizations, getOrganization } from "@/db/organizations"
import { getProject, getUserAdminProjectsWithDetail } from "@/db/projects"
import { getUserById } from "@/db/users"
import {
  CITIZEN_ATTESTATION_CODE,
  CITIZEN_TAGS,
  CITIZEN_TYPES,
} from "@/lib/constants"
import { CitizenLookup, CitizenshipQualification } from "@/lib/types"

import { updateMailchimpTags } from "../api/mailchimp"
import { createCitizenAttestation } from "../eas"

interface S8QualifyingUser {
  address: string
}

interface S8QualifyingChain {
  organizationId: string
}

interface S8QualifyingProject {
  projectId: string
}

export const s8CitizenshipQualification =
  async (): Promise<CitizenshipQualification | null> => {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return null
    }

    const user = await getUserById(userId)
    if (!user) {
      return null
    }

    const [userOrgs, userProjects] = await Promise.all([
      getAdminOrganizations(userId),
      getUserAdminProjectsWithDetail({ userId }),
    ])

    // ------------------------------------------------------------
    // Organization (Chain) qualification
    const qualifyingChains = await prisma.$queryRaw<S8QualifyingChain[]>`
    SELECT * FROM "S8QualifyingChain"
    WHERE "organizationId" = ANY(${
      userOrgs?.organizations.map((org) => org.organization.id) || []
    })
  `

    if (qualifyingChains.length > 0) {
      const existingCitizen = await prisma.citizen.findFirst({
        where: {
          organizationId: qualifyingChains[0].organizationId,
          attestationId: {
            not: null,
          },
        },
      })

      // Get the organization
      const organization = await getOrganization({
        id: qualifyingChains[0].organizationId,
      })

      // If the organization already has a citizen, return not eligible
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

      // Only one citizen per organization
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

    // ------------------------------------------------------------
    // Project (App) qualification
    const projectIds =
      userProjects?.projects.map(({ project }) => project.id) || []

    const qualifyingProjects = await prisma.$queryRaw<S8QualifyingProject[]>`
    SELECT * FROM "S8QualifyingProject"
    WHERE "projectId" = ANY(${projectIds})
  `

    if (qualifyingProjects.length > 0) {
      // Check if any of the qualifying projects already has a citizen
      const projectsWithCitizens = await prisma.$queryRaw<{ id: string }[]>`
      SELECT p.id
      FROM "Project" p
      INNER JOIN "Citizen" c ON c."projectId" = p.id 
      WHERE p.id = ANY(${qualifyingProjects.map(
        (p: S8QualifyingProject) => p.projectId,
      )})
    `
      // Get the first qualifying project
      const project = await getProject({ id: qualifyingProjects[0].projectId })

      // If any project has a citizen, return not eligible
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

    // ------------------------------------------------------------
    // User qualification

    // Check if user already has a citizen profile
    const existingCitizen = await getCitizenByType({
      type: CITIZEN_TYPES.user,
      id: userId,
    })

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

    const qualifyingAddress = await prisma.$queryRaw<S8QualifyingUser[]>`
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

// S8 Citizenship Limit Check
export const checkCitizenshipLimit = async (): Promise<boolean> => {
  const citizenCount = await getCitizenCountByType(CITIZEN_TYPES.user)
  return citizenCount >= 950
}

export const updateCitizen = async (citizen: {
  type: string
  address: string
  attestationId?: string
  timeCommitment?: string
}) => {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return {
      error: "Unauthorized",
    }
  }

  try {
    const result = await upsertCitizen({
      id: userId,
      citizen,
    })

    return result
  } catch (error) {
    console.error("Error updating citizen:", error)
    return {
      error: "Failed to update citizen",
    }
  }
}

export const getCitizen = async (
  lookup: CitizenLookup,
): Promise<Citizen | null> => {
  return await getCitizenByType(lookup)
}

export const attestCitizen = async () => {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return {
      error: "Unauthorized",
    }
  }

  const qualification = await s8CitizenshipQualification()

  if (!qualification?.eligible) {
    return {
      error: qualification?.error || "You are not eligible to become a Citizen",
    }
  }

  const citizenType =
    CITIZEN_TYPES[qualification.type as keyof typeof CITIZEN_TYPES]
  if (!citizenType) {
    return {
      error: "Invalid citizen type",
    }
  }

  const user = await getUserById(userId)
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

    await upsertCitizen({
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
    })

    await updateMailchimpTags([
      {
        email: user.emails[0].email,
        tags: [CITIZEN_TAGS[citizenType]],
      },
    ])
  } catch (error) {
    console.error("Error attesting citizen:", error)
    return {
      error: "Failed to attest citizen",
    }
  }
}
