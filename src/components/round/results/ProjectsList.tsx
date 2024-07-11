"use client"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import React from "react"

import ArrowLeftIcon from "@/components/icons/arrowLeftIcon"
import { Button } from "@/components/ui/button"
import { FundingRewardDetails } from "@/lib/types"

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
          {totalCount} projects applied to Round {round}
        </h1>
        <h1 className="text-xl font-semibold">Rewards</h1>
      </div>
      <hr />
      {projectRewards?.map((project, index) => (
        <React.Fragment key={project.id}>
          <div className="flex flex-row justify-between py-8">
            <div className="flex flex-row items-center">
              <Image
                className="rounded-md"
                src={project?.Project?.thumbnailUrl ?? ""}
                alt={project?.Project?.name}
                height={64}
                width={64}
              />
              <div className="ml-4">
                <h5 className="text-base font-semibold text-text-default">
                  {project?.Project?.name}
                </h5>
                <p className="text-base font-normal text-secondary-foreground">
                  {project?.Project?.description}
                </p>
              </div>
            </div>
            <div className="flex flex-row items-center">
              <Image
                src="/assets/images/optimism-small.png"
                alt="Optimism"
                width={24}
                height={24}
              />
              <span className="ml-2 text-base font-medium text-foreground">
                {Number(project?.amount).toLocaleString("en-US")}
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
