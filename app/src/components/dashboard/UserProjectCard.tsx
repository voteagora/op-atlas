import Image from "next/image"
import Link from "next/link"
import { reverse } from "ramda"
import { memo, useMemo } from "react"

import { Progress } from "@/components/ui/progress"
import { useProjectContracts } from "@/hooks/db/useProjectContracts"
import { useProjectDetails } from "@/hooks/db/useProjectDetails"
import { useIsAdmin } from "@/lib/hooks"
import {
  ApplicationWithDetails,
  ProjectTeam,
  ProjectWithDetails,
} from "@/lib/types"
import { cn, getProjectStatus } from "@/lib/utils"
import { projectHasUnpublishedChanges } from "@/lib/utils"

import ExternalLink from "../ExternalLink"
import { EnrolledCallout } from "../missions/common/callouts/EnrolledCallout"
import { Avatar, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"

const UserProjectCard = ({
  className,
  project,
  applications,
}: {
  className?: string
  project: ProjectWithDetails
  applications: ApplicationWithDetails[]
}) => {
  const team = [
    ...project.team,
    ...(project.organization?.organization?.team ?? []),
  ] as ProjectTeam

  const isAdmin = useIsAdmin(team)
  const projectHasChanges = projectHasUnpublishedChanges(
    project.snapshots,
    project.lastMetadataUpdate,
  )
  const hasBeenPublished = project ? project?.snapshots.length > 0 : false

  const { data: contracts } = useProjectContracts(project.id)
  const { data: projectDetails } = useProjectDetails(project.id)

  const progress = useMemo(() => {
    const { progressPercent } = getProjectStatus(
      projectDetails ?? null,
      contracts ?? null,
    )
    return progressPercent
  }, [projectDetails, contracts])

  const uniqueApplications = useMemo(() => {
    return applications
      ?.filter(
        (application) =>
          application.projectId === project.id &&
          (application.roundId === "7" || application.roundId === "8"),
      )
      .reduce<ApplicationWithDetails[]>((acc, application) => {
        if (!acc.some((app) => app.roundId === application.roundId)) {
          acc.push(application)
        }
        return acc
      }, [])
  }, [applications, project.id])

  return (
    <div
      className={cn(
        "flex flex-col gap-x-6 border rounded-xl hover:shadow-sm",
        className,
      )}
    >
      <Link
        href={`/projects/${project.id}/details`}
        className="flex gap-x-6 pt-8 px-8"
      >
        <div className="flex items-center justify-center border overflow-hidden rounded-lg bg-secondary h-32 w-32 shrink-0">
          {project.thumbnailUrl ? (
            <Image
              src={project.thumbnailUrl}
              width={160}
              height={160}
              alt="Project Image"
            />
          ) : (
            <Image
              src="/assets/icons/plus.svg"
              width={14}
              height={14}
              alt="Plus"
            />
          )}
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-start">
            <h3 className="mr-3 text-base truncate">{project.name}</h3>
          </div>

          <p className="text-base text-secondary-foreground mt-3 line-clamp-2">
            {project.description}
          </p>

          <div className="mt-auto h-6 flex items-center gap-x-2">
            {isAdmin && (
              <Badge variant="outline" className="text-xs font-medium h-full">
                Admin
              </Badge>
            )}

            {/* {project.contracts.length > 0 ? (
              <div className="h-full flex flex-row-reverse items-center w-fit mr-3">
                {reverse(uniqBy((c) => c.chainId, project.contracts)).map(
                  (contract, idx) => (
                    <div
                      key={contract.id}
                      className="w-6 h-6 -ml-1.5"
                      style={{ zIndex: idx }}
                    >
                      <ChainLogo chainId={contract.chainId.toString()} />
                    </div>
                  ),
                )}
              </div>
            ) : null} */}

            <div className="h-full flex flex-row-reverse items-center w-fit ml-1.5">
              {reverse(project.team).map(({ user }) => (
                <Avatar key={user.id} className="w-6 h-6 -ml-1.5 bg-background">
                  <AvatarImage src={user?.imageUrl ?? ""} />
                </Avatar>
              ))}
            </div>

            {projectHasChanges && hasBeenPublished && (
              <div className="text-xs font-medium text-red-700 bg-red-100 rounded-full px-2 py-1 ml-1.5">
                Unpublished edits
              </div>
            )}

            {project?.website?.length > 0 && (
              <ExternalLink href={project.website[0]}>
                <Button
                  variant="link"
                  className="px-3 py-1.5 text-secondary-foreground"
                >
                  Website
                </Button>
              </ExternalLink>
            )}
          </div>
        </div>
        {!hasBeenPublished && (
          <div className="m-auto">
            {progress === 100 ? (
              <div className="flex items-center">
                <Image
                  alt="Checkmark"
                  src="/assets/icons/circle-check-green.svg"
                  height={16}
                  width={16}
                  className="w-4 h-4 object-center object-cover"
                />
                <p className="ml-2 text-sm text-secondary-foreground">
                  Onchain
                </p>
              </div>
            ) : (
              <>
                <Progress value={progress} className="h-2 w-16" />
              </>
            )}
          </div>
        )}
      </Link>

      <div className="px-8 pb-8">
        {uniqueApplications?.map((application, i) => (
          <div key={application.id} className="mt-4">
            <EnrolledCallout
              key={application.id}
              application={application}
              index={i}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(UserProjectCard)
