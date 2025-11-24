import { Metadata } from "next"
import { notFound } from "next/navigation"

import { sharedMetadata } from "@/app/shared-metadata"
import { getOrganizationWithClient } from "@/db/organizations"
import { getRoleApplicationById, getRoleById } from "@/db/role"
import { getUserById } from "@/db/users"
import { getImpersonationContext } from "@/lib/db/sessionContext"
import { formatMMMd } from "@/lib/utils/date"

import { SuccessPageClient } from "./components/SuccessPageClient"

type PageProps = {
  params: { roleId: string; applicationId: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const role = await getRoleById(parseInt(params.roleId))
  return {
    ...sharedMetadata,
    title: `Governance: ${role?.title ?? ""} | Application - OP Atlas`,
    description: role?.description,
    openGraph: {
      ...sharedMetadata.openGraph,
      title: `Governance: ${role?.title ?? ""} | Application - OP Atlas`,
      description: role?.description?.slice(0, 240) || undefined,
    },
  }
}

export default async function Page({ params }: PageProps) {
  const { session, db } = await getImpersonationContext()

  const [role, application] = await Promise.all([
    getRoleById(parseInt(params.roleId), db),
    getRoleApplicationById(parseInt(params.applicationId), db),
  ])
  if (!role || !application) {
    notFound()
  }

  const isUser = !!application?.userId
  let user = null
  let org = null

  if (isUser) {
    user = await getUserById(application.userId!, db, session)
  } else {
    org = await getOrganizationWithClient(
      { id: application?.organizationId! },
      db,
    )
  }

  const forumText = `I'm a candidate for ${
    role.title
  }. Check out my qualifications here: https://atlas.optimism.io/${
    isUser ? user?.username : org?.id
  }`

  const voteSchedule =
    role?.voteStartAt && role?.voteEndAt
      ? `Delegates can vote from ${formatMMMd(
          new Date(role.voteStartAt!),
        )} - ${formatMMMd(new Date(role.voteEndAt!))}`
      : ""

  return (
    <SuccessPageClient
      role={role}
      isUser={isUser}
      user={user}
      org={org}
      forumText={forumText}
      voteSchedule={voteSchedule}
    />
  )
}
