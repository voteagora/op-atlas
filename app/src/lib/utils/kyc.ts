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
