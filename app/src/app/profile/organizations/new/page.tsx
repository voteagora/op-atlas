import { Metadata } from "next"
import { redirect } from "next/navigation"

import MakeOrganizationForm from "@/components/organizations/MakeOrganizationForm"
import { getUserById } from "@/db/users"
import { getImpersonationContext } from "@/lib/db/sessionContext"

export const maxDuration = 120

export const metadata: Metadata = {
  title: "Profile Organizations: New - OP Atlas",
  description:
    "Sign up on OP Atlas to vote for Citizen's House proposals, Retro Funding, and more.",
}

export default async function Page() {
  const { session, db, userId } = await getImpersonationContext()

  if (!userId) {
    redirect("/")
  }

  const user = await getUserById(userId, db, session)

  if (!user) {
    redirect("/")
  }
  return (
    <div className="flex flex-col gap-12 text-secondary-foreground">
      <h2 className="text-foreground text-2xl font-normal">
        New organization
      </h2>
      <MakeOrganizationForm user={user} />
    </div>
  )
}
