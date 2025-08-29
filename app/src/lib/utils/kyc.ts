import { KYCStreamTeam, KYCTeamWithTeam } from "../types"
import { RecurringRewardKycTeam } from "./rewards"
import { KYCUser } from "@prisma/client"

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

export function resolveProjectStatus(users: Pick<KYCUser, "personaStatus">[]) {
  // If any users are expired, failed, or declined, return "project_issue"
  if (
    users.some(
      (user) =>
        user.personaStatus === "expired" ||
        user.personaStatus === "failed" ||
        user.personaStatus === "declined",
    )
  ) {
    return "project_issue"
  }

  // If any users are created or pending, resolve to "pending
  if (
    users.some(
      (user) =>
        user.personaStatus === "created" || user.personaStatus === "pending",
    )
  ) {
    return "pending"
  }

  // If all users are completed or approved, resolve to "completed"
  if (
    users.every(
      (user) =>
        user.personaStatus === "completed" || user.personaStatus === "approved",
    )
  ) {
    return "completed"
  }

  // Default fallback
  return "pending"
}
