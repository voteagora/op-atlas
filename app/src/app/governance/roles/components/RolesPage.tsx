import { Role } from "@prisma/client"
import { AnalyticsTracker } from "@/app/governance/components/AnalyticsTracker"
import { RoleRow } from "@/app/governance/roles/components/RoleRow"

export default function RolesPage({ roles }: { roles: Role[] }) {
  return (
    <div className="flex flex-col gap-6">
      <h4 className="w-full font-semibold text-[20px] leading-7 align-middle text-text-default">
        Self-nominate for a governance role in Season 8 & 9
      </h4>

      <AnalyticsTracker />

      <div className="flex flex-col">
        {roles.map((role, index) => (
          <RoleRow key={role.id} role={role} rounded={index === 0} />
        ))}
      </div>
    </div>
  )
}
