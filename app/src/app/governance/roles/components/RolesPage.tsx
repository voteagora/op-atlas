import { Role } from "@prisma/client"

import { AnalyticsTracker } from "@/app/governance/components/AnalyticsTracker"
import { RoleRow } from "@/app/governance/roles/components/RoleRow"
import { getRolePhaseStatus } from "@/lib/utils/roles"

export default function RolesPage({ roles }: { roles: Role[] }) {
  const hasASecurityRole = roles.every((role) => role.isSecurityRole)
  const isInVotingPhase = roles.every(
    (role) => getRolePhaseStatus(role).isVotingPhase,
  )

  const isInEndorsementPhase = roles.every(
    (role) => getRolePhaseStatus(role).isEndorsementPhase,
  )

  const title = () => {
    if (hasASecurityRole) {
      if (isInEndorsementPhase) {
        return "Approval period for candidates"
      }
      return "Self-nominate for the Security Council"
    }
    return "Self-nominate for a governance role in Season 8 & 9"
  }

  const hideRoles = isInVotingPhase && hasASecurityRole

  if (hideRoles) {
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="w-full font-normal text-[20px] leading-7 align-middle text-text-default">
          {title()}
        </h4>
        {hasASecurityRole && (
          <p className="text-secondary-foreground">
            Candidates must receive 8 approvals from Top 100 Delegates to move
            on to the vote.
          </p>
        )}
      </div>

      <AnalyticsTracker />

      <div className="flex flex-col">
        {roles.map((role) => (
          <RoleRow key={role.id} role={role} />
        ))}
      </div>
    </div>
  )
}
