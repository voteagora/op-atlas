"use server"

import { ProjectContract } from "@prisma/client"
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

import { updateMailchimpTags } from "../api/mailchimp"

interface S8QualifyingUser {
  id: string
  address: string
}

interface S8QualifyingChain {
  id: string
  organizationId: string
}

interface S8QualifyingProject {
  id: string
  address: string
}

export const s8CitizenshipQualification = async (): Promise<{
  type: string
  identifier: string
  title: string
  avatar: string
} | null> => {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return null
  }

  // Get user with addresses
  const user = await getUserById(userId)
  if (!user) {
    return null
  }

  // Get user's organizations and projects
  const [userOrgs, userProjects] = await Promise.all([
    getUserOrganizationsWithDetails(userId),
    getUserAdminProjectsWithDetail({ userId }),
  ])

  // Check S8QualifyingChain organizations (highest priority)
  const qualifyingChains = await prisma.$queryRaw<S8QualifyingChain[]>`
    SELECT * FROM "S8QualifyingChain"
    WHERE "organizationId" = ANY(${
      userOrgs?.organizations.map((org) => org.organization.id) || []
    })
  `

  if (qualifyingChains.length > 0) {
    const organization = await getOrganization({
      id: qualifyingChains[0].organizationId,
    })

    return {
      type: CITIZEN_TYPES.chain,
      identifier: organization?.id || "",
      title: organization?.name || "",
      avatar: organization?.avatarUrl || "",
    }
  }

  // Check S8QualifyingProject addresses (second priority)
  const projectContracts =
    userProjects?.projects.flatMap(({ project }) => {
      // Safely access contracts if present
      const maybeContracts = (project as any).contracts
      if (Array.isArray(maybeContracts)) {
        return maybeContracts.map(
          (contract: ProjectContract) => contract.contractAddress,
        )
      }
      return []
    }) || []

  const qualifyingProjects = await prisma.$queryRaw<S8QualifyingProject[]>`
    SELECT * FROM "S8QualifyingProject"
    WHERE address = ANY(${projectContracts})
  `

  if (qualifyingProjects.length > 0) {
    const project = await getProject({ id: qualifyingProjects[0].id })
    return {
      type: CITIZEN_TYPES.app,
      identifier: qualifyingProjects[0].address,
      title: project?.name || "",
      avatar: project?.thumbnailUrl || "",
    }
  }

  // Check the number of citizens, and if it's more than 1000, return null
  const citizenCount = await getCitizenCountByType(CITIZEN_TYPES.user)
  if (citizenCount >= 1000) {
    return null
  }

  // Check S8QualifyingUser addresses (lowest priority)
  const qualifyingUsers = await prisma.$queryRaw<S8QualifyingUser[]>`
    SELECT * FROM "S8QualifyingUser"
    WHERE address = ANY(${user.addresses.map((addr) => addr.address)})
  `

  if (qualifyingUsers.length > 0) {
    return {
      type: CITIZEN_TYPES.user,
      identifier: qualifyingUsers[0].address,
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
    const primaryAddress = user.addresses.find((addr) => addr.primary)?.address
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
      },
    })

    await updateMailchimpTags([
      {
        email: user.email,
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
