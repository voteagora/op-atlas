import { prisma } from "@/db/client"
import { isProjectBlacklisted } from "@/db/projects"

import { KYCTeamWithTeam } from "../types"

export async function isKycTeamVerified(kycTeam?: KYCTeamWithTeam) {
  if (!kycTeam || kycTeam.deletedAt || kycTeam.team.length === 0) {
    return false
  }

  // Check if all team members are approved
  const allTeamMembersApproved = kycTeam.team.every(
    (teamMember) => teamMember.users.status === "APPROVED",
  )

  if (!allTeamMembersApproved) {
    return false
  }

  // Check if any projects associated with this KYC team are blacklisted
  // We need to fetch the projects since they're not included in KYCTeamWithTeam
  const projects = await prisma.project.findMany({
    where: {
      kycTeamId: kycTeam.id,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  })

  // Check if any projects are blacklisted
  for (const project of projects) {
    const blacklisted = await isProjectBlacklisted(project.id)
    if (blacklisted) {
      return false
    }
  }

  return true
}
