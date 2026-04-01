"use client"

import { memo, useMemo } from "react"

import type { ProjectActionDTO } from "@/lib/dto"
import { unclaimedRewards } from "@/lib/rewards"

import { ProjectRewardRow } from "./dialogs/UnclaimedRewardsDialog"

function UnclaimedRewardsCard({
  projects,
}: {
  projects: ProjectActionDTO[]
}) {
  const projectsWithUnclaimedRewards = useMemo(() => {
    return projects.filter((project) => unclaimedRewards(project).length > 0)
  }, [projects])

  return (
    <div className="flex flex-col gap-2 max-w-full">
      {projectsWithUnclaimedRewards.map((project) => (
        <ProjectRewardRow key={project.id} project={project} />
      ))}
    </div>
  )
}

export default memo(UnclaimedRewardsCard)
