import { notFound } from "next/navigation"

import PublicOrganizationProfile from "@/components/organizations/public/PublicOrganizationProfile"
import PublicUserProfile from "@/components/profile/public/PublicProfile"
import {
  getOrganizations,
  getOrganizationWithDetails,
} from "@/db/organizations"
import { getUserByUsername } from "@/db/users"
import { getAllPublishedProjects } from "@/lib/actions/projects"

export default async function PublicProfile({
  params,
}: {
  params: { id: string }
}) {
  if (params.id.startsWith("0x") && params.id.length === 66) {
    const organization = await getOrganizationWithDetails({ id: params.id })

    if (!organization) {
      notFound()
    }

    return <PublicOrganizationProfile organization={organization} />
  }

  const user = await getUserByUsername(params.id)

  if (!user) {
    notFound()
  }

  const [organizations, projects] = await Promise.all([
    getOrganizations(user.id),
    getAllPublishedProjects(user.id),
  ])

  return (
    <PublicUserProfile
      user={user}
      organizations={organizations || []}
      projects={projects}
    />
  )
}
