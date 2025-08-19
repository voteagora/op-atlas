import { Metadata } from "next"
import { redirect } from "next/navigation"

import { sharedMetadata } from "@/app/shared-metadata"
import { auth } from "@/auth"
import MakeOrganizationForm from "@/components/organizations/MakeOrganizationForm"
import MakeOrganizationFormHeader from "@/components/organizations/MakeOrganizationFormHeader"
import { getOrganization } from "@/db/organizations"
import { getUserById } from "@/db/users"
import { updateInteractions } from "@/lib/actions/users"

export async function generateMetadata({
  params,
}: {
  params: { organizationId: string }
}): Promise<Metadata> {
  const organization = await getOrganization({ id: params.organizationId })
  const title = `Profile Organizations: ${organization?.name ?? ""} - OP Atlas`
  const description = organization?.description ?? ""
  return {
    ...sharedMetadata,
    title,
    description,
    openGraph: {
      ...sharedMetadata.openGraph,
      title,
      description,
    },
  }
}

export const maxDuration = 120

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
    getOrganization({ id: params.organizationId }),
  ])

  if (!organization || !user) {
    redirect("/dashboard")
  }

  updateInteractions({ userId: session.user.id, orgSettingsVisited: true })

  return (
    <div className="flex flex-col gap-12 text-secondary-foreground">
      <MakeOrganizationFormHeader organization={organization} />
      <MakeOrganizationForm user={user} organization={organization} />
    </div>
  )
}
