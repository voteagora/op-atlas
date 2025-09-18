import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { sharedMetadata } from "@/app/shared-metadata"
import { auth } from "@/auth"
import KYCStatusContainer, {
  KYCStatusTitle,
} from "@/components/projects/grants/grants/kyc-status/KYCStatusContainer"
import { getOrganization, getOrganizationKYCTeams } from "@/db/organizations"
import { getUserOrganizationRole, verifyOrganizationMembership } from "@/lib/actions/utils"

import GrantAddressForm from "./components/GrantAddressForm"

export async function generateMetadata({
  params,
}: {
  params: { organizationId: string }
}): Promise<Metadata> {
  const organization = await getOrganization({ id: params.organizationId })
  const title = `Profile Organizations: ${
    organization?.name ?? ""
  } | Grant Addresses - OP Atlas`
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

export default async function Page({
  params,
}: {
  params: { organizationId: string }
}) {
  // Authenticate user
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/")
  }

  const userId = session.user.id

  // Check user membership - redirect non-members to homepage
  const userRole = await getUserOrganizationRole(params.organizationId, userId)
  if (userRole === null) {
    redirect("/")
  }  

  const isAdmin = userRole === "admin"  

  // Ensure organization exists
  const organization = await getOrganization({ id: params.organizationId })
  if (!organization) {
    return notFound()
  }
  // Determine if org has any KYC teams with users 
  const orgKycTeams = await getOrganizationKYCTeams({ organizationId: params.organizationId })
  const hasAnyKycTeamsWithUsers = orgKycTeams.some(kycOrg => {
    const tamUsers = kycOrg.team.team.flatMap((t: any) => t.users || [])
    return tamUsers.length > 0
  })
  const hasAnyKycTeams = (organization.OrganizationKYCTeams?.length ?? 0) > 0

  return (
    <div className="space-y-12">
      <KYCStatusTitle hasKYCTeamWithUsers={hasAnyKycTeamsWithUsers} />
      {/* Show KYC status container if there are any KYC teams (old or new flow) */}
      {hasAnyKycTeams && (
        <KYCStatusContainer organization={organization} isAdmin={isAdmin} />
      )}
      {/* Always show grant address form - use existing KYC teams to switch to "Add" variant */}
      <GrantAddressForm hasExistingVerifiedAddresses={hasAnyKycTeams} isAdmin={isAdmin} />
    </div>
  )
}
