import { KYCTeamWithTeam } from "../types"

export function isKycTeamVerified(kycTeam?: KYCTeamWithTeam) {
  return Boolean(
    kycTeam &&
      !kycTeam.deletedAt &&
      kycTeam.team.length > 0 &&
      kycTeam.team.every(
        (teamMember) => teamMember.users.status === "APPROVED",
      ),
  )
}
