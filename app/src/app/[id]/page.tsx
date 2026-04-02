import { notFound } from "next/navigation"

import PublicOrganizationProfile from "@/components/organizations/public/PublicOrganizationProfile"
import PublicUserProfile from "@/components/profile/public/PublicProfile"
import {
  getPublicOrganizationPageData,
  getPublicUserPageData,
} from "@/lib/publicProfiles"

import ProfileNotFound from "./profile-not-found"

export default async function PublicProfile({
  params,
}: {
  params: { id: string }
}) {
  if (params.id.startsWith("0x") && params.id.length === 66) {
    const organization = await getPublicOrganizationPageData(params.id)

    if (!organization) {
      notFound()
    }

    return <PublicOrganizationProfile organization={organization} />
  }

  const publicUserPage = await getPublicUserPageData(params.id)

  if (!publicUserPage) {
    return <ProfileNotFound params={params} />
  }

  return (
    <PublicUserProfile
      user={publicUserPage.user}
      organizations={publicUserPage.organizations}
      projects={publicUserPage.projects}
    />
  )
}
