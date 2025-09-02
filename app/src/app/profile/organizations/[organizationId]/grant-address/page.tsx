import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { sharedMetadata } from "@/app/shared-metadata"
import { auth } from "@/auth"
import KYCStatusContainer, {
  KYCStatusTitle,
} from "@/components/projects/grants/grants/kyc-status/KYCStatusContainer"
import {
  getOrganization,
  getOrganizationWithGrantEligibility,
} from "@/db/organizations"

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

  // Fetch organization data with grant eligibility status
  const { organization, hasKycTeamWithSubmittedForm } =
    await getOrganizationWithGrantEligibility({
      organizationId: params.organizationId,
    })

  if (!organization) {
    return notFound()
  }

  // If they have KYC team and submitted grant eligibility form, show the status container
  if (hasKycTeamWithSubmittedForm) {
    return (
      <div className="space-y-12">
        <KYCStatusTitle />
        <KYCStatusContainer organization={organization} />
      </div>
    )
  }

  // Otherwise, just show the grant address form
  return <GrantAddressForm />
}
