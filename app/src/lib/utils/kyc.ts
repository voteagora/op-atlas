import { KYCUser } from "@prisma/client"

import { KYCStreamTeam, KYCTeamWithTeam } from "../types"
import { RecurringRewardKycTeam } from "./rewards"

export function isKycTeamVerified(kycTeam?: KYCTeamWithTeam) {
  return Boolean(
    kycTeam &&
      !kycTeam.deletedAt &&
      kycTeam.team.length > 0 &&
      kycTeam.team.every(
        (teamMember) => teamMember.users.status === "APPROVED",
      ) &&
      !kycTeam.projects.some((project) => project.blacklist),
  )
}

export function isKycStreamTeamVerified(
  kycTeam?: KYCStreamTeam | RecurringRewardKycTeam,
) {
  return Boolean(
    kycTeam &&
      !kycTeam.deletedAt &&
      kycTeam.team.length > 0 &&
      kycTeam.team.every(
        (teamMember) => teamMember.users.status === "APPROVED",
      ),
  )
}

export function resolveProjectStatus(users: Pick<KYCUser, "status" | "expiry">[]) {
  const now = new Date()

  // Check for expired APPROVED users first
  if (users.some((user) =>
    user.status === "APPROVED" &&
    user.expiry &&
    new Date(user.expiry) < now
  )) {
    return "EXPIRED"
  }

  // If any users are REJECTED, return "project_issue"
  if (users.some((user) => user.status === "REJECTED")) {
    return "project_issue"
  }

  // If any users are PENDING, resolve to "PENDING"
  if (users.some((user) => user.status === "PENDING")) {
    return "PENDING"
  }

  // If all users are APPROVED and not expired
  if (
    users.every((user) => {
      if (user.status !== "APPROVED") {
        return false
      }
      if (!user.expiry) {
        return true
      }
      return new Date(user.expiry) > now
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
