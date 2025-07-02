"use server"

import { AnalyticsTracker } from "@/app/governance/components/AnalyticsTracker"
import { RoleRow } from "@/app/governance/roles/components/RoleRow"
import { getAllRoles } from "@/db/role"
import { auth } from "@/auth"
import ProposalsPage from "@/components/proposals/proposalsPage/ProposalsPage"

export default async function Page() {
  const roles = await getAllRoles()
  const session = await auth()
  const userId = session?.user?.id

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <div className="mt-8 bg-background flex flex-col p-16 w-full max-w-6xl rounded-3xl z-10">
        <div className="flex flex-col w-full">
          <h1 className="text-4xl font-semibold">Governance</h1>
          <ProposalsPage userId={userId} />
        </div>
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
      </div>
    </main>
  )
}
