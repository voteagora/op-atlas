"use client"

import { ProjectWithDetails } from "@/lib/types"

import RewardAccordion from "./RewardAccordion"

export function RewardsSection({ project }: { project: ProjectWithDetails }) {
  const rewards = project.rewards

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <h2>Project rewards</h2>
        <div className="text-text-secondary">
          If this project receives any Retro Funding, we&apos;ll record it here.
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {rewards?.map((reward) => (
          <RewardAccordion
            team={project.team}
            reward={reward}
            key={reward.id}
          />
        ))}
      </div>
    </div>
  )
}
