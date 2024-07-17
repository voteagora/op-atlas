"use client"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import React from "react"

import ExternalLink from "@/components/ExternalLink"
import ArrowLeftIcon from "@/components/icons/arrowLeftIcon"
import { Button } from "@/components/ui/button"
import { FundingRewardDetails } from "@/lib/types"
import { useAnalytics } from "@/providers/AnalyticsProvider"

interface Props {
  projectRewards: FundingRewardDetails[]
  loading: boolean
  round: string | number
  totalCount: number
  handleLoadMore: () => void
  isFetchingMore: boolean
}

const ProjectsList = ({
  projectRewards,
  loading,
  round,
  totalCount,
  handleLoadMore,
  isFetchingMore,
}: Props) => {
  const getProjectUrl = (projectName: string) => {
    const formattedName = projectName
      .replace(/ /g, "-")
      .replace(/[^a-zA-Z0-9-]/g, "")
    return `https://retropgfhub.com/explore/RetroPGF4/${formattedName}`
  }
  const { track } = useAnalytics()

  function formatAmount(amount: number) {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-4">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-row justify-between w-full mt-6 pb-4">
        <h1 className="text-xl font-semibold">
          {totalCount} projects rewarded in Round {round}
        </h1>
        <h1 className="text-xl font-semibold">Rewards</h1>
      </div>
      <hr />
      {projectRewards?.map((project) => (
        <React.Fragment key={project.id}>
          <div className="flex flex-row justify-between py-8 gap-1">
            <div className="flex flex-[2] items-center">
              <Image
                className="rounded-md"
                src={project?.project?.thumbnailUrl ?? ""}
                alt={project?.project?.name}
                height={64}
                width={64}
              />
              <div className="ml-4">
                <ExternalLink
                  className="hover:underline"
                  href={getProjectUrl(project.project.name)}
                  onClick={() => {
                    track("Project rewarded", {
                      projectId: project.project.id,
                      projectName: project.project.name,
                    })
                  }}
                >
                  <h5 className="text-xs sm:text-base font-semibold text-text-default">
                    {project?.project?.name}
                  </h5>
                </ExternalLink>
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
              <span className="ml-2 text-xs sm:text-base font-medium text-foreground">
                {formatAmount(Number(project?.amount))}
              </span>
            </div>
          </div>
          <hr />
        </React.Fragment>
      ))}
      {totalCount > projectRewards?.length && (
        <Button
          variant="outline"
          className="mt-6 text-base font-medium flex justify-center items-center gap-2 mx-auto"
          onClick={handleLoadMore}
          isLoading={isFetchingMore}
        >
          Show more
          <ArrowLeftIcon fill="#0F111A" className=" -rotate-90" />
        </Button>
      )}
    </div>
  )
}

export default ProjectsList
