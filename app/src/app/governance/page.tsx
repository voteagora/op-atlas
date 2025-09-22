import { auth } from "@/auth"
import ProposalsPage from "@/components/proposals/proposalsPage/ProposalsPage"
import { getAllRoles } from "@/db/role"

import RolesPage from "./roles/components/RolesPage"

export const metadata = {
  title: "Governance: Roles - OP Atlas",
  description:
    "Sign up on OP Atlas to vote for Citizen's House proposals, Retro Funding, and more.",
  openGraph: { title: "Governance: Roles - OP Atlas" },
}

export default async function Page() {
  const [roles, session] = await Promise.all([getAllRoles(), auth()])
  const hasRoles = roles.length > 0
  const securityRoles = roles.filter((role) =>
    role.isSecurityRole,
  )
  const userId = session?.user?.id

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <div className="mt-4 bg-background flex flex-col px-6 py-12 lg:px-0 w-full max-w-6xl gap-12">
        <div className="flex flex-col w-full">
          <h1 className="text-[36px] leading-[44px] tracking-[0%] font-semibold text-text-default">
            Governance
          </h1>
        </div>
        {hasRoles && <RolesPage roles={roles} />}
        <ProposalsPage userId={userId} securityRoles={securityRoles} />
      </div>
    </main>
  )
}
