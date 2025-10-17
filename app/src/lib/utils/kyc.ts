import { KYCUser } from "@prisma/client"

import { KYCStreamTeam, KYCTeamWithTeam } from "../types"
import { RecurringRewardKycTeam } from "./rewards"

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

export function resolveProjectStatus(users: Pick<KYCUser, "status">[]) {
  // If any users are expired, failed, or declined, return "project_issue"
  if (users.some((user) => user.status === "REJECTED")) {
    return "project_issue"
  }

  // If any users are PENDING, resolve to "Pending"
  if (users.some((user) => user.status === "PENDING")) {
    return "PENDING"
  }

  // If all users are APPROVED, resolve to "Approved"
  if (users.every((user) => user.status === "APPROVED")) {
    return "APPROVED"
  }

  // Default fallback
  return "PENDING"
}
