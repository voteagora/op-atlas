import { Role } from "@prisma/client"
import { AnalyticsTracker } from "@/app/governance/components/AnalyticsTracker"
import { RoleRow } from "@/app/governance/roles/components/RoleRow"

export default function RolesPage({ roles }: { roles: Role[] }) {
  return (
    <div className="flex flex-col mt-10 gap-6">
      <div className="flex flex-col w-full">
        <div className="text-1xl font-semibold text-foreground">
          Self-nominate for a governance role in Season 8 & 9
        </div>
      </div>

      <AnalyticsTracker />

      <div className="flex flex-col rounded-lg border border-border-secondary">
        {roles.map((role) => (
          <RoleRow key={role.id} role={role} />
        ))}
      </div>
    </div>
  )
}
