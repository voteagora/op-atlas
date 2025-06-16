"use server"

import { getAllRoles } from "@/db/role"

import { Role } from "./components/Role"

export default async function Page() {
  const roles = await getAllRoles()

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <div className="mt-8 p-6 sm:mt-8 sm:p-16 bg-background flex flex-col w-full max-w-6xl rounded-3xl z-10">
        <div className="flex flex-col gap-y-8">
          <div>
            <div className="flex justify-between items-center flex-wrap sm:flex-nowrap gap-4">
              <div className="flex flex-col w-full">
                <h1 className="text-4xl font-semibold text-text-default">
                  Roles
                </h1>
                <p className="mt-2 text-base font-normal text-text-secondary">
                  Explore available roles within the Optimism Collective
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <Role key={role.id} role={role} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
