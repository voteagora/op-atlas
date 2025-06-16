"use server"

import { getAllRoles } from "@/db/role"

import { RoleRow } from "./components/RoleRow"

export default async function Page() {
  const roles = await getAllRoles()

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <div className="mt-8 p-6 sm:mt-8 sm:p-16 bg-background flex flex-col w-full max-w-6xl rounded-3xl z-10">
        <div className="flex flex-col gap-y-8">
          <div>
            <div className="flex justify-between items-center flex-wrap sm:flex-nowrap gap-4">
              <div className="flex flex-col w-full">
                <div className="text-1xl font-semibold text-foreground">
                  Self-nominate for a governance role in Season 8 & 9
                </div>
                <div className="text-sm text-muted-foreground">
                  Calling all candidates! Submit your self-nomination from
                  [Start Date] – [End Date].
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-lg border border-border-secondary gap-4">
            {roles.map((role) => (
              <RoleRow key={role.id} role={role} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
