import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { sharedMetadata } from "@/app/shared-metadata"
import { auth } from "@/auth"
import { getOrganization, getOrganizationWithGrantEligibility } from "@/db/organizations"
import KYCStatusContainer, {
  KYCStatusTitle,
} from "@/components/projects/grants/grants/kyc-status/KYCStatusContainer"
import { getOrganizationKycTeamsAction } from "@/lib/actions/organizations"
import { getKycTeamForProject } from "@/db/projects"
import GrantDeliveryAddressSection from "@/components/projects/rewards/GrantDeliveryAddressSection"
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
  const { 
    organization, 
    hasKycTeamWithSubmittedForm 
  } = await getOrganizationWithGrantEligibility({ 
    organizationId: params.organizationId 
  })
  
  if (!organization) {
    return notFound()
  }

  // If they have KYC team and submitted grant eligibility form, show the status container
  if (hasKycTeamWithSubmittedForm) {
    // Fetch organization KYC teams
    const organizationKycTeams = await getOrganizationKycTeamsAction({
      organizationId: organization.id,
    })

    // Flatten projects and resolve them
    const projects = organizationKycTeams.flatMap((org) => org.team.projects)
    const resolvedProjects = await Promise.all(
      projects.map((project) => getKycTeamForProject({ projectId: project.id })),
    )

    return (
      <div className="space-y-12">
        <KYCStatusTitle />
        {/* For KYC team statuses */}
        {resolvedProjects.map(
          (project) =>
            project && <KYCStatusContainer key={project.id} project={project} />,
        )}
      </div>
    )
  }

  // Otherwise, just show the grant address form
  return (
    <GrantAddressForm />
  )
}
