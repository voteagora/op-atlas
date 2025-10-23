import { KYCUser } from "@prisma/client"

import { KYCStreamTeam, KYCTeamWithTeam } from "../types"
import { RecurringRewardKycTeam } from "./rewards"
import { KYCOrLegal } from "@/components/projects/types"

/**
 * Check if a KYC user or legal entity is expired
 * @param item - KYCUser or LegalEntityContact
 * @returns true if the item is approved but expired
 */
export function isExpired(item: KYCOrLegal): boolean {
  return (
    item.status === "APPROVED" &&
    item.expiry !== null &&
    item.expiry !== undefined &&
    new Date(item.expiry) < new Date()
  )
}

export function isKycTeamVerified(kycTeam?: KYCTeamWithTeam) {
  const now = new Date()

  return Boolean(
    kycTeam &&
      !kycTeam.deletedAt &&
      kycTeam.team.length > 0 &&
      // Check all KYCUsers are APPROVED and not expired
      kycTeam.team.every(
        (teamMember) =>
          teamMember.users.status === "APPROVED" &&
          teamMember.users.expiry &&
          new Date(teamMember.users.expiry) > now
      ) &&
      // Check all KYCLegalEntities are APPROVED and not expired (if any exist)
      (
        !kycTeam.KYCLegalEntityTeams ||
        kycTeam.KYCLegalEntityTeams.length === 0 ||
        kycTeam.KYCLegalEntityTeams.every(
          (entityTeam) =>
            entityTeam.legalEntity.status === "APPROVED" &&
            (!entityTeam.legalEntity.expiry || new Date(entityTeam.legalEntity.expiry) > now)
        )
      ) &&
      !kycTeam.projects.some((project) => project.blacklist),
  )
}

export function isKycStreamTeamVerified(
  kycTeam?: KYCStreamTeam | RecurringRewardKycTeam,
) {
  const now = new Date()

  return Boolean(
    kycTeam &&
      !kycTeam.deletedAt &&
      kycTeam.team.length > 0 &&
      // Check all KYCUsers are APPROVED and not expired
      kycTeam.team.every(
        (teamMember) =>
          teamMember.users.status === "APPROVED" &&
          teamMember.users.expiry &&
          new Date(teamMember.users.expiry) > now
      ) &&
      // Check all KYCLegalEntities are APPROVED and not expired (if any exist)
      (
        !kycTeam.KYCLegalEntityTeams ||
        kycTeam.KYCLegalEntityTeams.length === 0 ||
        kycTeam.KYCLegalEntityTeams.every(
          (entityTeam) =>
            entityTeam.legalEntity.status === "APPROVED" &&
            (!entityTeam.legalEntity.expiry || new Date(entityTeam.legalEntity.expiry) > now)
        )
      ),
  )
}

export function resolveProjectStatus(
  users: Array<{ status: KYCUser["status"]; expiry: KYCUser["expiry"] | null }>,
  legalEntities?: Array<{ status: KYCUser["status"]; expiry: KYCUser["expiry"] | null }>
) {
  const now = new Date()
  const allEntities = [...users, ...(legalEntities || [])]

  // Check for expired APPROVED users or legal entities first
  if (allEntities.some((entity) =>
    entity.status === "APPROVED" &&
    entity.expiry &&
    new Date(entity.expiry) < now
  )) {
    return "EXPIRED"
  }

  // If any users or legal entities are REJECTED, return "project_issue"
  if (allEntities.some((entity) => entity.status === "REJECTED")) {
    return "project_issue"
  }

  // If any users or legal entities are PENDING, resolve to "PENDING"
  if (allEntities.some((entity) => entity.status === "PENDING")) {
    return "PENDING"
  }

  // If all users and legal entities are APPROVED and not expired
  if (
    allEntities.every((entity) => {
      if (entity.status !== "APPROVED") {
        return false
      }
      if (!entity.expiry) {
        return true
      }
      return new Date(entity.expiry) > now
    })
  ) {
    return "APPROVED"
  }

  // Default fallback
  return "PENDING"
}

export function hasExpiredKYC(kycTeam?: KYCTeamWithTeam): boolean {
  if (!kycTeam) return false

  const now = new Date()

  // Check KYCUsers
  const hasExpiredUsers = kycTeam.team.some(
    (teamMember) =>
      teamMember.users.status === "APPROVED" &&
      teamMember.users.expiry &&
      new Date(teamMember.users.expiry) < now
  )

  // Check KYCLegalEntities
  const hasExpiredEntities = kycTeam.KYCLegalEntityTeams?.some(
    (entityTeam) =>
      entityTeam.legalEntity.status === "APPROVED" &&
      entityTeam.legalEntity.expiry &&
      new Date(entityTeam.legalEntity.expiry) < now
  ) || false

  return hasExpiredUsers || hasExpiredEntities
}
