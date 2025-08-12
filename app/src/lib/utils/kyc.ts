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
