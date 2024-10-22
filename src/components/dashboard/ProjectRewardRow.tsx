import Image from "next/image"
import Link from "next/link"

import { noRewards, unclaimedRewards } from "@/lib/rewards"
import { ProjectWithDetails } from "@/lib/types"
import { formatNumber } from "@/lib/utils"

import { Button } from "../ui/button"

export function ProjectRewardRow({ project }: { project: ProjectWithDetails }) {
  if (!project.applications.length) {
    return null
  }

  if (noRewards([project])) {
    return (
      <div className="border border-border bg-background rounded-xl p-8 flex items-center gap-4 max-w-full">
        {project.thumbnailUrl && (
          <Image
            src={project.thumbnailUrl}
            height={48}
            width={48}
            className="rounded-md"
            alt="Project thumbnail"
          />
        )}
        <div className="flex-1 min-w-0 text-nowrap overflow-hidden overflow-ellipsis mr-8 flex-col">
          <div className="font-semibold ">{project.name}</div>
          <div className="text-sm text-secondary-foreground">
            Your project did not receive rewards in Round 4
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-border bg-background rounded-xl p-8 flex items-center gap-4 max-w-full">
      {project.thumbnailUrl && (
        <Image
          src={project.thumbnailUrl}
          height={48}
          width={48}
          className="rounded-md"
          alt="Project thumbnail"
        />
      )}
      <div className="flex-1 min-w-0 text-nowrap overflow-hidden overflow-ellipsis mr-8 flex-col">
        <div className="font-semibold ">{project.name}</div>
        <div className="text-sm text-secondary-foreground">
          Claim by Aug 5, 2025
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Image
          src="/assets/chain-logos/optimism.png"
          height={24}
          width={24}
          alt="Optimism"
        />
        <div className="font-semibold">
          {/* @ts-expect-error Next converts Decimal to number bc Server Components suck */}
          {formatNumber(project.rewards[0].amount)}
        </div>
      </div>
      <Link href={`/rewards/${project.rewards[0].id}`}>
        <Button
          variant={unclaimedRewards(project) ? "destructive" : "secondary"}
        >
          {unclaimedRewards(project) ? "Claim" : "Claimed"}
        </Button>
      </Link>
    </div>
  )
}
