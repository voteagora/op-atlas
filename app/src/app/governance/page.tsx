"use server"

import { auth } from "@/auth"
import ProposalsPage from "@/components/proposals/proposalsPage/ProposalsPage"
import { getAllRoles } from "@/db/role"

import RolesPage from "./roles/components/RolesPage"

export default async function Page() {
  const roles = await getAllRoles()
  const session = await auth()
  const userId = session?.user?.id

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <div className="mt-4 bg-background flex flex-col p-16 lg:px-0 w-full max-w-[1064px] gap-12">
        <div className="flex flex-col w-full">
          <h1 className="text-[36px] leading-[44px] tracking-[0%] font-semibold text-text-default">
            Governance
          </h1>
        </div>
        <RolesPage roles={roles} />
        <ProposalsPage userId={userId} />
      </div>
    </main>
  )
}
