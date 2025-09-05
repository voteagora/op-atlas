import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { sharedMetadata } from "@/app/shared-metadata"
import { auth } from "@/auth"
import KYCStatusContainer, {
  KYCStatusTitle,
} from "@/components/projects/grants/grants/kyc-status/KYCStatusContainer"
import {
  getOrganization,
  getOrganizationWithAllGrantData,
} from "@/db/organizations"
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
  const membershipCheck = await verifyOrganizationMembership(params.organizationId, userId)
  if (membershipCheck?.error) {
    redirect("/")
  }

  // Get user role
  const userRole = await getUserOrganizationRole(params.organizationId, userId)
  const isAdmin = userRole === "admin"

  // Fetch organization data with all grant eligibility information
  const organizationData = await getOrganizationWithAllGrantData({
    organizationId: params.organizationId,
  })

  if (!organizationData?.organization) {
    return notFound()
  }

  const { organization, hasSubmittedForms } = organizationData

  return (
    <div className="space-y-12">
      <KYCStatusTitle />
      {/* Show KYC status container if there are submitted forms with KYC teams */}
      {hasSubmittedForms && (
        <KYCStatusContainer organization={organization} isAdmin={isAdmin} />
      )}
      {/* Always show grant address form - variant depends on existing verified addresses */}
      <GrantAddressForm hasExistingVerifiedAddresses={hasSubmittedForms} isAdmin={isAdmin} />
    </div>
  )
}
