import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { sharedMetadata } from "@/app/shared-metadata"
import { auth } from "@/auth"
import { Button } from "@/components/common/Button"
import KYCStatusContainer, {
  KYCStatusTitle,
} from "@/components/projects/grants/grants/kyc-status/KYCStatusContainer"
import GrantDeliveryAddress from "@/components/projects/rewards/GrantDeliveryAddress"
import GrantDeliveryAddressSection from "@/components/projects/rewards/GrantDeliveryAddressSection"
import { getKycTeamForProject } from "@/db/projects"
import { getPublicProjectAction } from "@/lib/actions/projects"
import { getUserProjectRole, verifyMembership } from "@/lib/actions/utils"

export async function generateMetadata({
  params,
}: {
  params: {
    projectId: string
  }
}): Promise<Metadata> {
  const project = await getPublicProjectAction({ projectId: params.projectId })

  const title = `Project Grant-address: ${project?.name ?? ""} - OP Atlas`
  const description = project?.description ?? ""
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
  params: { projectId: string }
}) {
  const session = await auth()
  const userId = session?.user.id

  if (!userId) {
    redirect("/")
  }

  // Check user membership - redirect non-members to homepage
  const membershipCheck = await verifyMembership(params.projectId, userId)
  if (membershipCheck?.error) {
    redirect("/")
  }

  // Get user role
  const userRole = await getUserProjectRole(params.projectId, userId)
  const isAdmin = userRole === "admin"

  const project = await getKycTeamForProject({ projectId: params.projectId })
  const kycTeam = project?.kycTeam ?? undefined
  const hasKycTeamWithUsers = !!(
    kycTeam &&
    kycTeam.team &&
    kycTeam.team.length > 0
  )

  return (
    <div className="space-y-12">
      <KYCStatusTitle hasKYCTeamWithUsers={hasKycTeamWithUsers} />
      {project?.organization?.organization?.id ? (
        <>
          <GrantDeliveryAddress kycTeam={kycTeam} />
          <Button>
            <Link
              href={`/profile/organizations/${project.organization.organization.id}/grant-address`}
            >
              Go to organization settings
            </Link>
          </Button>
        </>
      ) : (
        !hasKycTeamWithUsers && (
          <div className="space-y-6">
            <GrantDeliveryAddressSection
              projectId={params.projectId}
              isAdmin={isAdmin}
            />
          </div>
        )
      )}

      {project && hasKycTeamWithUsers && (
        <KYCStatusContainer project={project} isAdmin={isAdmin} />
      )}
    </div>
  )
}
