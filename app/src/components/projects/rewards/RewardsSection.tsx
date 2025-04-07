"use client"

import { ProjectTeam, ProjectWithFullDetails } from "@/lib/types"

import RewardAccordion from "./RewardAccordion"

export function RewardsSection({
  project,
  team,
}: {
  project: ProjectWithFullDetails & { organizationId?: string }
  team: ProjectTeam
}) {
  const rewards = project.rewards.filter(
    (reward) => parseInt(reward.roundId) < 7, // Don't show Season 7 yet
  )

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col space-y-6">
        <h2>Rewards</h2>
        <div className="text-secondary-foreground">
          If this project receives any Retro Funding, we&apos;ll record it here.
        </div>
        {rewards.length ? (
          <div className="space-y-4">
            {rewards.map((reward) => (
              <RewardAccordion team={team} reward={reward} key={reward.id} />
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground px-3 py-2.5 rounded-md w-full border">
            No grants yet
          </span>
        )}
      </div>
    </div>
  )
}
