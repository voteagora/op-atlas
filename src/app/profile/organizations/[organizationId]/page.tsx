import { redirect } from "next/navigation"

import { auth } from "@/auth"
import MakeOrganizationForm from "@/components/organizations/MakeOrganizationForm"
import MakeOrganizationFormHeader from "@/components/organizations/MakeOrganizationFormHeader"
import { getOrganization } from "@/db/organizations"
import { getUserById } from "@/db/users"

export default async function Page({
  params,
}: {
  params: { organizationId: string }
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  const [user, organization] = await Promise.all([
    getUserById(session.user.id),
    getOrganization(params.organizationId),
  ])

  if (!organization || !user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex flex-col gap-12 text-secondary-foreground">
      <MakeOrganizationFormHeader organization={organization} />
      <MakeOrganizationForm user={user} organization={organization} />
    </div>
  )
}
