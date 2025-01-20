import Image from "next/image"
import Link from "next/link"
import { reverse, uniqBy } from "ramda"
import { memo, useMemo } from "react"

import { Progress } from "@/components/ui/progress"
import { useIsAdmin } from "@/lib/hooks"
import { ApplicationWithDetails, ProjectWithDetails } from "@/lib/types"
import { cn, getProjectStatus } from "@/lib/utils"
import { projectHasUnpublishedChanges } from "@/lib/utils"

import { ChainLogo } from "../common/ChainLogo"
import ExternalLink from "../ExternalLink"
import { Avatar, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Check, ChevronRight, CircleHelp, Loader2 } from "lucide-react"
import { Callout } from "../common/Callout"
import { format } from "date-fns"
import { EnrolledCallout } from "../missions/Callouts"

const UserProjectCard = ({
  className,
  project,
  applications,
  handleActiveRoundHelpClick,
}: {
  className?: string
  project: ProjectWithDetails
  applications: ApplicationWithDetails[]
  handleActiveRoundHelpClick: () => void
}) => {
  const isAdmin = useIsAdmin(project)
  const projectHasChanges = projectHasUnpublishedChanges(project)
  const hasBeenPublished = project ? project?.snapshots.length > 0 : false

  const progress = useMemo(() => {
    const { progressPercent } = getProjectStatus(project)
    return progressPercent
  }, [project])

  const roundName = "Onchain Builders"
  const approvedDate = new Date("2025-02-01T21:53:13.300Z")

  return (
    <div
      // href={`/projects/${project.id}/details`}
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

            {project.contracts.length > 0 ? (
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
            ) : null}

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
        {applications?.map((application) => {
          return application.projectId === project.id ? (
            <div className="mt-4">
              <EnrolledCallout name={application.round.name} />
            </div>
          ) : (
            <></>
          )
        })}
        {/* <div className="mt-4">
          <EnrolledCallout name={roundName} /> */}
        {/* <Callout
            type="success"
            showIcon={false}
            leftAlignedContent={
              <div className="flex">
                <Image
                  alt="Info"
                  src={"/assets/icons/sunny-smiling.png"}
                  width={20}
                  height={20}
                />
                <p className="text-sm font-medium mr-5 ml-2">
                  {`Retro Funding: ` + roundName}
                </p>
              </div>
            }
            rightAlignedContent={
              <div className="flex items-center gap-1 ml-auto shrink-0 text-sm font-medium">
                <Check width={16} height={16} />
                <span>Active since {format(approvedDate, "MMM d")}</span>{" "}
                <span>|</span>
                <Button
                  variant={"ghost"}
                  size={"xs"}
                  className={"gap-2"}
                  onClick={handleActiveRoundHelpClick}
                >
                  Rewards Monthly
                  <CircleHelp width={16} height={16} />
                </Button>
              </div>
            }
          /> */}
        {/* </div> */}

        {/* <div className="mt-4">
          <Callout
            type="info"
            showIcon={false}
            leftAlignedContent={
              <div className="flex">
                <Image
                  alt="Info"
                  src={"/assets/icons/sunny-smiling.png"}
                  width={20}
                  height={20}
                />
                <p className="text-sm font-medium mr-5 ml-2">
                  {`Retro Funding: ` + roundName}
                </p>
              </div>
            }
            rightAlignedContent={
              <div className="flex items-center gap-1 ml-auto shrink-0 text-sm font-medium">
                <Loader2 width={16} height={16} />
                <span>Pending approval</span> <span>|</span>
                <Button variant={"ghost"} size={"xs"}>
                  View confirmation
                  <ChevronRight width={16} height={16} />
                </Button>
              </div>
            }
          />
        </div> */}
      </div>
    </div>
  )
}

export default memo(UserProjectCard)
