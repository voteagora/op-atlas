import Image from "next/image"
import Link from "next/link"

import type { ProjectActionDTO } from "@/lib/dto"
import { noRewardsPriorToRound } from "@/lib/rewards"
import { formatNumber } from "@/lib/utils"

import { Button } from "../ui/button"

export function ProjectRewardRow({ project }: { project: ProjectActionDTO }) {
  if (!project.applications.length || noRewardsPriorToRound(project, 7)) {
    return null
  }

  return (
    <>
      {project.rewards.map((reward) => (
        <div
          key={reward.id}
          className="border border-border bg-background rounded-xl p-8 flex items-center gap-4 max-w-full"
        >
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
            <div className="font-normal ">
              {project.name} - Round {reward.roundId}
            </div>
            <div className="text-sm text-secondary-foreground">
              Claim by Aug 5, 2025
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="/assets/icons/op-icon.svg"
              height={24}
              width={24}
              alt="Optimism"
            />
            <div className="font-normal">{formatNumber(reward.amount)}</div>
          </div>
          <Link href={`/projects/${project.id}/rewards`}>
            <Button variant="secondary">Claim</Button>
          </Link>
        </div>
      ))}
    </>
  )
}
