"use server"

import { revalidatePath } from "next/cache"
import { CitizenRegistrationStatus } from "@prisma/client"

import { auth } from "@/auth"
import { prisma } from "@/db/client"
import { isUserAdminOfOrganization } from "@/db/organizations"
import { getUserById } from "@/db/users"
import { revokeCitizenAttestation } from "@/lib/eas/serverOnly"
import { getUserProjectRole } from "@/lib/actions/utils"

export async function resignCitizenSeason(citizenSeasonId: string) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    console.warn("[citizenship] resign attempt without session", {
      citizenSeasonId,
    })
    return { error: "Unauthorized" }
  }

  const citizenSeason = await prisma.citizenSeason.findUnique({
    where: { id: citizenSeasonId },
  })

  if (!citizenSeason) {
    console.warn("[citizenship] resign attempt for missing record", {
      citizenSeasonId,
      actorUserId: userId,
    })
    return { error: "Citizen record not found" }
  }

  const user = await getUserById(userId)

  if (!user) {
    console.warn("[citizenship] resign attempt with missing user", {
      citizenSeasonId,
      actorUserId: userId,
    })
    return { error: "Unauthorized" }
  }

  const normalizedUserAddresses =
    user.addresses?.map((address) => address.address.toLowerCase()) ?? []

  const governanceAddress = citizenSeason.governanceAddress?.toLowerCase()
  const hasGovernanceWallet =
    governanceAddress !== undefined &&
    normalizedUserAddresses.includes(governanceAddress)

  let hasEntityAdminRights = true
  const isEntityCitizen =
    Boolean(citizenSeason.organizationId) || Boolean(citizenSeason.projectId)

  if (citizenSeason.organizationId) {
    hasEntityAdminRights = await isUserAdminOfOrganization(
      userId,
      citizenSeason.organizationId,
    )
  } else if (citizenSeason.projectId) {
    const role = await getUserProjectRole(citizenSeason.projectId, userId)
    hasEntityAdminRights = role === "admin"
  }

  const isUserCitizen = citizenSeason.userId === userId
  const isAuthorized =
    isUserCitizen ||
    (isEntityCitizen && hasGovernanceWallet && hasEntityAdminRights)

  if (!isAuthorized) {
    console.warn("[citizenship] resign unauthorized", {
      citizenSeasonId,
      actorUserId: userId,
      targetUserId: citizenSeason.userId,
      governanceAddress: citizenSeason.governanceAddress,
      hasGovernanceWallet,
      hasEntityAdminRights,
      organizationId: citizenSeason.organizationId,
      projectId: citizenSeason.projectId,
    })
    return { error: "Unauthorized" }
  }

  const targetType = citizenSeason.organizationId
    ? "organization"
    : citizenSeason.projectId
    ? "project"
    : "user"

  if (citizenSeason.attestationId) {
    try {
      await revokeCitizenAttestation(citizenSeason.attestationId)
    } catch (error) {
      console.error("Failed to revoke attestation:", error)
      return { error: "Failed to revoke attestation" }
    }
  }

  try {
    await prisma.citizenSeason.update({
      where: { id: citizenSeasonId },
      data: {
        registrationStatus: CitizenRegistrationStatus.REVOKED,
      },
    })
  } catch (error) {
    console.error("Failed to update citizen season:", error)
    return { error: "Failed to update citizen record" }
  }

  await Promise.all([
    revalidatePath("/citizenship"),
    revalidatePath("/dashboard"),
  ])

  console.info("[citizenship] resign success", {
    citizenSeasonId,
    actorUserId: userId,
    targetUserId: citizenSeason.userId,
    type: targetType,
  })

  return { success: true }
}
