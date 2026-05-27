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
  const id = decodeURIComponent(params.id)

  if (id.startsWith("0x") && id.length === 66) {
    const organization = await getPublicOrganizationPageData(id)

    if (!organization) {
      notFound()
    }

    return <PublicOrganizationProfile organization={organization} />
  }

  const publicUserPage = await getPublicUserPageData(id)

  if (!publicUserPage) {
    return <ProfileNotFound params={{ id }} />
  }

  return (
    <PublicUserProfile
      user={publicUserPage.user}
      organizations={publicUserPage.organizations}
      projects={publicUserPage.projects}
    />
  )
}
