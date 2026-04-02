import { Metadata } from "next"
import { redirect } from "next/navigation"

import { sharedMetadata } from "@/app/shared-metadata"
import MakeOrganizationForm from "@/components/organizations/MakeOrganizationForm"
import MakeOrganizationFormHeader from "@/components/organizations/MakeOrganizationFormHeader"
import { getOrganizationWithClient } from "@/db/organizations"
import { getUserById } from "@/db/users"
import { getUserOrganizationRole } from "@/lib/actions/utils"
import { updateInteractions } from "@/lib/actions/users"
import { getImpersonationContext } from "@/lib/db/sessionContext"

export async function generateMetadata({
  params,
}: {
  params: { organizationId: string }
}): Promise<Metadata> {
  const organization = await getOrganizationWithClient({
    id: params.organizationId,
  })
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
  const { session, db, userId } = await getImpersonationContext()
  if (!userId) {
    redirect("/")
  }

  const [user, userRole] = await Promise.all([
    getUserById(userId, db, session),
    getUserOrganizationRole(params.organizationId, userId, db),
  ])

  if (!user || userRole === null) {
    redirect("/")
  }

  const organization = await getOrganizationWithClient(
    { id: params.organizationId },
    db,
  )

  if (!organization) {
    redirect("/dashboard")
  }

  if (!session?.impersonation?.isActive) {
    updateInteractions({ userId, orgSettingsVisited: true })
  }

  return (
    <div className="flex flex-col gap-12 text-secondary-foreground">
      <MakeOrganizationFormHeader organization={organization} />
      <MakeOrganizationForm user={user} organization={organization} />
    </div>
  )
}
