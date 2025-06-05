"use server"

import { headers } from "next/headers"

import { auth } from "@/auth"
import {
  getCitizenCountByType,
  getUserCitizen,
  upsertCitizen,
} from "@/db/citizens"
import { prisma } from "@/db/client"
import {
  getOrganization,
  getUserOrganizationsWithDetails,
} from "@/db/organizations"
import { getProject, getUserAdminProjectsWithDetail } from "@/db/projects"
import { getUserById } from "@/db/users"
import {
  CITIZEN_ATTESTATION_CODE,
  CITIZEN_TAGS,
  CITIZEN_TYPES,
} from "@/lib/constants"
import { CitizenshipQualification } from "@/lib/types"

import { updateMailchimpTags } from "../api/mailchimp"

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
      getUserOrganizationsWithDetails(userId),
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
        },
      })

      // Get the organization
      const organization = await getOrganization({
        id: qualifyingChains[0].organizationId,
      })

      // Only one citizen per organization
      if (!existingCitizen && organization) {
        return {
          type: CITIZEN_TYPES.chain,
          identifier: organization.id,
          title: organization.name,
          avatar: organization.avatarUrl,
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
      // Find the first project that doesn't have a citizen yet
      const projectWithoutCitizen = await prisma.$queryRaw<{ id: string }[]>`
      SELECT p.id
      FROM "Project" p
      LEFT JOIN "Citizen" c ON c."projectId" = p.id
      WHERE p.id = ANY(${qualifyingProjects.map(
        (p: S8QualifyingProject) => p.projectId,
      )})
      AND c.id IS NULL
      LIMIT 1
    `

      if (projectWithoutCitizen.length > 0) {
        const project = await getProject({ id: projectWithoutCitizen[0].id })

        if (project) {
          return {
            type: CITIZEN_TYPES.app,
            identifier: project.id,
            title: project.name,
            avatar: project.thumbnailUrl,
          }
        }
      }
    }

    // ------------------------------------------------------------
    // User qualification

    // Check if user already has a citizen profile
    const existingCitizen = await getUserCitizen(userId)
    if (existingCitizen && existingCitizen.attestationId) {
      console.log("User already has a citizen profile")
      return null
    }

    // Check the active Citizenship limit
    const citizenCount = await getCitizenCountByType(CITIZEN_TYPES.user)
    if (citizenCount >= 1000) {
      console.log("Citizenship limit reached")
      return null
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
      }
    }

    return null
  }

export const updateCitizen = async (citizen: {
  type: string
  address?: string
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

export const getCitizenByUserId = async (userId: string) => {
  const citizen = await getUserCitizen(userId)
  return citizen
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
  if (!qualification) {
    return {
      error: "You are not eligible to become a Citizen",
    }
  }

  const citizenType =
    CITIZEN_TYPES[qualification.type as keyof typeof CITIZEN_TYPES]
  if (!citizenType) {
    return {
      error: "Invalid citizen type",
    }
  }

  try {
    // Get user with addresses
    const user = await getUserById(userId)
    if (!user) {
      return {
        error: "User not found",
      }
    }

    // Get primary address
    const primaryAddress = user.addresses.find(
      (addr: { primary: boolean; address: string }) => addr.primary,
    )?.address
    if (!primaryAddress) {
      return {
        error: "No primary address set",
      }
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/eas/attestation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: headers().get("cookie") || "",
        },
        body: JSON.stringify({
          address: primaryAddress,
          farcasterId: user.farcasterId,
          selectionMethod: CITIZEN_ATTESTATION_CODE[citizenType],
        }),
      },
    )

    if (!response.ok) {
      const error = await response.json()
      return {
        error: error.error || "Failed to attest citizen",
      }
    }

    const { attestationId } = await response.json()

    const result = await upsertCitizen({
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

    return result
  } catch (error) {
    console.error("Error attesting citizen:", error)
    return {
      error: "Failed to attest citizen",
    }
  }
}

export const revokeCitizen = async (attestationId: string) => {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return {
      error: "Unauthorized",
    }
  }

  try {
    // Call the API to revoke the attestation
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/eas/attestation`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Cookie: headers().get("cookie") || "",
        },
        body: JSON.stringify({
          attestationId,
        }),
      },
    )

    if (!response.ok) {
      const error = await response.json()
      return {
        error: error.error || "Failed to revoke citizen attestation",
      }
    }

    return { success: true }
  } catch (error) {
    return {
      error: "Failed to revoke citizen attestation",
    }
  }
}
