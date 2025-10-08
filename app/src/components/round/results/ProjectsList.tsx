"use client"

import { Loader2 } from "lucide-react"
import Image from "next/image"
import React from "react"

import { Button } from "@/components/common/Button"
import TrackedLink from "@/components/common/TrackedLink"
import ArrowLeftIcon from "@/components/icons/arrowLeftIcon"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { FundingRewardDetails } from "@/lib/types"
import { formatNumber, truncateString } from "@/lib/utils"
import { useAnalytics } from "@/providers/AnalyticsProvider"

interface Props {
  projectRewards: FundingRewardDetails[]
  loading: boolean
  totalCount: number
  handleLoadMore: () => void
  isFetchingMore: boolean
}

const ProjectsList = ({
  projectRewards,
  loading,
  totalCount,
  handleLoadMore,
  isFetchingMore,
}: Props) => {
  const { track } = useAnalytics()

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-4">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {projectRewards?.map((project) => (
        <React.Fragment key={project.id}>
          <TrackedLink
            className="block transition-colors group"
            href={`/project/${project?.project?.id}`}
            onClick={() => {
              track("Project rewarded", {
                projectId: project.project.id,
                projectName: project.project.name,
                elementType: "Link",
                elementName: project.project.name,
              })
            }}
            eventName="Link Click"
            eventData={{
              source: "round_results",
              projectId: project.project.id,
              projectName: project.project.name,
              linkName: "Project Page",
            }}
          >
            <div className="flex flex-row justify-between py-8 gap-1">
              <div className="flex flex-[2] items-center">
                {project?.project?.thumbnailUrl && (
                  <Image
                    className="rounded-md"
                    src={project.project.thumbnailUrl}
                    alt={project.project.name}
                    height={64}
                    width={64}
                  />
                )}
                <div className="ml-4">
                  <Tooltip>
                    <TooltipTrigger>
                      <h5 className="text-xs sm:text-base font-normal text-text-default text-left group-hover:underline">
                        {truncateString(project?.project?.name, 64, "...")}
                      </h5>
                    </TooltipTrigger>
                    <TooltipContent>{project?.project?.name}</TooltipContent>
                  </Tooltip>
                  <p className="text-xs sm:text-base font-normal text-secondary-foreground line-clamp-3">
                    {project?.project?.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-[1] items-center justify-end">
                <Image
                  src="/assets/images/optimism-small.png"
                  alt="Optimism"
                  width={24}
                  height={24}
                />
                <span className="ml-2 text-xs sm:text-base font-normal text-foreground">
                  {formatNumber(Number(project?.amount), 1)}
                </span>
              </div>
            </div>
          </TrackedLink>
          <hr />
        </React.Fragment>
      ))}
      {totalCount > projectRewards?.length && (
        <div className="w-full flex justify-center items-center mt-6">
          <Button
            variant="secondary"
            onClick={handleLoadMore}
            isLoading={isFetchingMore}
            rightIcon={<ArrowLeftIcon fill="#0F111A" className=" -rotate-90" />}
          >
            Show more
          </Button>
        </div>
      )}
    </div>
  )
}

export default ProjectsList
