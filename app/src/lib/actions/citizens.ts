"use server"

import { ProjectContract } from "@prisma/client"

import { auth } from "@/auth"
import { getUserCitizen, upsertCitizen } from "@/db/citizens"
import { prisma } from "@/db/client"
import { getUserOrganizationsWithDetails } from "@/db/organizations"
import { getUserAdminProjectsWithDetail } from "@/db/projects"
import { getUserById } from "@/db/users"
import { CITIZEN_TYPES } from "@/lib/constants"
import { createCitizenAttestation } from "@/lib/eas"

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

export const isQualifyingForS8Citizenship = async (): Promise<Array<{
  type: string
  qualifyingAddress?: string
  qualifyingOrgId?: string
  qualifyingProjectId?: string
}> | null> => {
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

  const qualifyingResults = []

  // Check S8QualifyingUser addresses
  const qualifyingUsers = await prisma.$queryRaw<S8QualifyingUser[]>`
    SELECT * FROM "S8QualifyingUser"
    WHERE address = ANY(${user.addresses.map((addr) => addr.address)})
  `

  if (qualifyingUsers.length > 0) {
    qualifyingResults.push({
      type: CITIZEN_TYPES.user,
      qualifyingAddress: qualifyingUsers[0].address,
    })
  }

  // Check S8QualifyingChain organizations
  const qualifyingChains = await prisma.$queryRaw<S8QualifyingChain[]>`
    SELECT * FROM "S8QualifyingChain"
    WHERE "organizationId" = ANY(${
      userOrgs?.organizations.map((org) => org.organization.id) || []
    })
  `

  if (qualifyingChains.length > 0) {
    qualifyingResults.push({
      type: CITIZEN_TYPES.chain,
      qualifyingOrgId: qualifyingChains[0].organizationId,
    })
  }

  // Check S8QualifyingProject addresses
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
    qualifyingResults.push({
      type: CITIZEN_TYPES.project,
      qualifyingProjectId: qualifyingProjects[0].id,
    })
  }

  return qualifyingResults
}

export const updateCitizen = async (citizen: {
  type?: string
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

    // Create attestation
    const attestationId = await createCitizenAttestation({
      to: primaryAddress,
      farcasterId: user.farcasterId ? parseInt(user.farcasterId) : 0,
      selectionMethod: CITIZEN_TYPES.user,
    })

    // Update citizen record
    const result = await upsertCitizen({
      id: userId,
      citizen: {
        address: primaryAddress,
        attestationId,
        type: CITIZEN_TYPES.user,
      },
    })

    return result
  } catch (error) {
    console.error("Error attesting citizen:", error)
    return {
      error: "Failed to attest citizen",
    }
  }
}
