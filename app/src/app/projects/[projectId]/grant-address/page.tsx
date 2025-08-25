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
import KYCStatusContainer from "@/components/projects/grants/grants/kyc-status/KYCStatusContainer"
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

  console.log(project?.organization)

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
      <KYCStatusContainer />
    </div>
  )
}
