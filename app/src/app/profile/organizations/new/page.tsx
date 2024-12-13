import { redirect } from "next/navigation"

import { auth } from "@/auth"
import MakeOrganizationForm from "@/components/organizations/MakeOrganizationForm"
import { getUserById } from "@/db/users"

export const maxDuration = 120

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  const user = await getUserById(session.user.id)

  if (!user) {
    redirect("/")
  }
  return (
    <div className="flex flex-col gap-12 text-secondary-foreground">
      <h2 className="text-foreground text-2xl font-semibold">
        New organization
      </h2>
      <MakeOrganizationForm user={user} />
    </div>
  )
}
