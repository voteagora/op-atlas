import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { sharedMetadata } from "@/app/shared-metadata"
import { auth } from "@/auth"
import { Button } from "@/components/common/Button"
import GrantDeliveryAddress from "@/components/projects/rewards/GrantDeliveryAddress"
import GrantDeliveryAddressSection from "@/components/projects/rewards/GrantDeliveryAddressSection"
import KYCStatusContainer, {
  KYCStatusTitle,
} from "@/components/projects/grants/grants/kyc-status/KYCStatusContainer"
import { getProjectWithGrantEligibility } from "@/db/projects"
import { getPublicProjectAction } from "@/lib/actions/projects"

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

  const { project, hasSubmittedGrantEligibility } = await getProjectWithGrantEligibility({ 
    projectId: params.projectId 
  })
  const kycTeam = project?.kycTeam ?? undefined

  return (
    <div className="space-y-12">
      <KYCStatusTitle />
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
        !hasSubmittedGrantEligibility && (
          <div className="space-y-6">
            <GrantDeliveryAddressSection 
              projectId={params.projectId}
            />
          </div>
        )
      )}
      
      {project && hasSubmittedGrantEligibility && (
        <KYCStatusContainer project={project} />
      )}
    </div>
  )
}
