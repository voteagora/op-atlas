import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { sharedMetadata } from "@/app/shared-metadata"
import { auth } from "@/auth"
import { Button } from "@/components/common/Button"
import GrantDeliveryAddress from "@/components/projects/rewards/GrantDeliveryAddress"
import { getKycTeamForProject } from "@/db/projects"
import { getPublicProjectAction } from "@/lib/actions/projects"

import { AddGrantDeliveryAddressContainer } from "./components"

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

  const project = await getKycTeamForProject({ projectId: params.projectId })

  const kycTeam = project?.kycTeam ?? undefined

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <h2>Grant Delivery Address</h2>
        <p className="text-secondary-foreground font-normal">
          Add the address(es) your rewards will be delivered to. You can do this
          at any time, and your entry will be valid for one year.
        </p>
        <p className="text-secondary-foreground font-normal">
          KYC (identity verification) is required for each address.
        </p>
      </div>
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
        <div className="space-y-6">
          <AddGrantDeliveryAddressContainer projectId={params.projectId} />
          <div>
            <p className="text-secondary-foreground text-sm font-normal">
              Need help? Contact{" "}
              <Link
                href="mailto:retrofunding@optimism.io"
                className="underline"
              >
                retrofunding@optimism.io
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
