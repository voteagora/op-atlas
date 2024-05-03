import Image from "next/image"
import Link from "next/link"
import { reverse } from "ramda"
import { memo, useMemo } from "react"

import { Progress } from "@/components/ui/progress"
import { ProjectWithDetails } from "@/lib/types"
import { cn, getProjectStatus } from "@/lib/utils"

import { ChainLogo } from "../common/ChainLogo"
import ExternalLink from "../ExternalLink"
import { Avatar, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"

const UserProjectCard = ({
  className,
  project,
}: {
  className?: string
  project: ProjectWithDetails
}) => {
  const progress = useMemo(() => {
    const { progressPercent } = getProjectStatus(project)
    return progressPercent
  }, [project])

  return (
    <div className={cn("flex gap-x-6 border rounded-2xl p-6", className)}>
      <div className="flex items-center justify-center border overflow-hidden rounded-lg bg-secondary h-40 w-40 shrink-0">
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
          <h3 className="mr-3 pt-1 truncate">{project.name}</h3>

          <div className="ml-auto flex items-center shrink-0">
            <Progress value={progress} className="h-2 w-16" />
            <p className="ml-3 text-sm text-secondary-foreground">
              {progress}% setup{" "}
            </p>
            <Link href={`/projects/${project.id}/details`} className="ml-6">
              <Button size="sm" variant="secondary">
                Edit
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-col">
          <p className="text-secondary-foreground line-clamp-3">
            {project.description}
          </p>
        </div>

        <div className="mt-auto h-6 flex items-center">
          {project.contracts.length > 0 ? (
            <div className="h-full flex flex-row-reverse items-center w-fit mr-3 ml-1.5">
              {reverse(project.contracts).map((contract, idx) => (
                <div
                  key={contract.id}
                  className="w-6 h-6 -ml-1.5"
                  style={{ zIndex: idx }}
                >
                  <ChainLogo chainId={contract.chainId.toString()} />
                </div>
              ))}
            </div>
          ) : null}

          <div className="h-full flex flex-row-reverse items-center w-fit ml-1.5">
            {reverse(project.team).map(({ user }) => (
              <Avatar key={user.id} className="w-6 h-6 -ml-1.5 bg-background">
                <AvatarImage src={user?.imageUrl ?? ""} />
              </Avatar>
            ))}
          </div>

          {project?.website?.length > 0 && (
            <ExternalLink href={project.website[0]} className="ml-2">
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
    </div>
  )
}

export default memo(UserProjectCard)
