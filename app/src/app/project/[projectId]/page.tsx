import { Metadata } from "next"
import { notFound } from "next/navigation"

import { sharedMetadata } from "@/app/shared-metadata"
import { getCitizen } from "@/lib/actions/citizens"
import { getProjectMetadataAction } from "@/lib/actions/projects"
import { CITIZEN_TYPES } from "@/lib/constants"
import { getProjectDeployedChains } from "@/lib/oso/utils"
import { withImpersonation } from "@/lib/db/sessionContext"

import { Contributors, Description, Header } from "./components"
import MissionSection from "./components/MissionSection"

interface PageProps {
  params: {
    projectId: string
  }
}

export async function generateMetadata({
  params,
}: {
  params: {
    projectId: string
  }
}): Promise<Metadata> {
  const project = await getProjectMetadataAction({
    projectId: params.projectId,
  })

  const title = `Project: ${project?.name ?? ""} - OP Atlas`
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

export default async function Page({ params }: PageProps) {
  const { projectId } = params

  const { userId } = await withImpersonation()

  const [project, citizen] = await Promise.all([
    getProjectMetadataAction({ projectId }),
    getCitizen({ type: CITIZEN_TYPES.app, id: projectId }),
  ])

  if (!project) {
    return notFound()
  }

  const deployedOn = getProjectDeployedChains(project.contracts)

  const author = project.organization
    ? {
        avatarUrl: project.organization.organization.avatarUrl,
        name: project.organization.organization.name,
        farcasterHandle: "",
        id: project.organization.organization.id,
      }
    : {
        avatarUrl: project.team?.[0]?.user.imageUrl,
        name: project.team?.[0]?.user.name,
        farcasterHandle: project.team?.[0]?.user.username ?? "",
      }

  return (
    <div className="w-full h-full lg:mt-6 pb-12">
      <div className="mx-auto w-full max-w-[1128px] lg:px-8 lg:space-y-20">
        <div className="w-full lg:mt-8">
          <Header
            projectId={projectId}
            userId={userId ?? undefined}
            thumbnail={project.thumbnailUrl}
            banner={project.bannerUrl}
            citizenAttested={citizen?.attestationId ? true : false}
          />
        </div>

        <div className="mt-[88px] lg:mt-0 lg:space-y-20 px-6 lg:px-12 lg:pt-12">
          <Description
            projectId={projectId}
            userId={userId}
            name={project.name}
            tags={["Project", project.category ?? ""]}
            author={author}
            deployedOn={deployedOn}
            description={project.description}
            socials={{
              website: project.website,
              farcaster: project.farcaster,
              twitter: project.twitter,
              mirror: project.mirror,
            }}
          />

          {!project.organization && (project.team?.length ?? 0) > 1 && (
            <Contributors
              contributors={project.team!.map(({ user }) => ({
                imageUrl: user.imageUrl,
                name: user.name,
                username: user.username ?? undefined,
                id: user.id,
              }))}
            />
          )}

          <MissionSection projectId={projectId} userId={userId} />
        </div>
      </div>
    </div>
  )
}
