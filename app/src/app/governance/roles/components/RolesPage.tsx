import { Role } from "@prisma/client"
import { AnalyticsTracker } from "@/app/governance/components/AnalyticsTracker"
import { RoleRow } from "@/app/governance/roles/components/RoleRow"

export default function RolesPage({ roles }: { roles: Role[] }) {
  return (
    <div className="flex flex-col">
      <div className="w-full mb-4 text-h4">
        Self-nominate for a governance role in Season 8 & 9
      </div>

      <AnalyticsTracker />

      <div className="flex flex-col">
        {roles.map((role, index) => (
          <RoleRow key={role.id} role={role} rounded={index === 0} />
        ))}
      </div>
    </div>
  )
}
