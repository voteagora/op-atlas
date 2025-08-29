import { Metadata } from "next"
import { redirect } from "next/navigation"
import { sharedMetadata } from "@/app/shared-metadata"
import { auth } from "@/auth"
import { getOrganization } from "@/db/organizations"
import KYCStatusContainer, {
  KYCStatusTitle,
} from "@/components/projects/grants/grants/kyc-status/KYCStatusContainer"
import { getOrganizationKycTeamsAction } from "@/lib/actions/organizations"
import { getKycTeamForProject } from "@/db/projects"

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

  // Fetch organization data
  const organization = await getOrganization({ id: params.organizationId })
  if (!organization) {
    return (
      <div>
        <h1>Organization not found</h1>
        <p>The organization you are looking for does not exist.</p>
      </div>
    )
  }

  // Fetch organization KYC teams
  const organizationKycTeams = await getOrganizationKycTeamsAction({
    organizationId: organization.id,
  })

  // Flatten projects and resolve them
  const projects = organizationKycTeams.flatMap((org) => org.team.projects)
  const resolvedProjects = await Promise.all(
    projects.map((project) => getKycTeamForProject({ projectId: project.id })),
  )

  // Pass resolved data to the client-side component
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
