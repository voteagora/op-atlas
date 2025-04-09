"use client"

import { useIsAdmin } from "@/lib/hooks"
import { ProjectTeam, ProjectWithFullDetails } from "@/lib/types"

import RewardAccordion from "./RewardAccordion"

export function RewardsSection({
  team,
  inProgressRewards,
  claimedRewards,
  verifiedKycTeams,
}: {
  team: ProjectTeam
  inProgressRewards: ProjectWithFullDetails["rewards"]
  claimedRewards: ProjectWithFullDetails["rewards"]
  verifiedKycTeams: Record<string, boolean>
}) {
  const isAdmin = useIsAdmin(team)

  return (
    <div className="flex flex-col space-y-12">
      <div className="space-y-6">
        <h2 className="text-2xl text-text-default font-semibold">Rewards</h2>
        <p className="text-secondary-foreground text-base font-normal">
          If this project receives any Retro Funding, we&apos;ll record it here.
        </p>
      </div>
      <div className="flex flex-col space-y-4">
        <h4 className="font-semibold text-text-default text-xl">In progress</h4>
        {inProgressRewards.length ? (
          <ul className="space-y-3">
            {inProgressRewards.map((reward) => (
              <li key={reward.id}>
                <RewardAccordion
                  isAdmin={Boolean(isAdmin)}
                  team={team}
                  reward={reward}
                  key={reward.id}
                  teamVerified={verifiedKycTeams[reward.projectId] ?? false}
                />
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-sm text-muted-foreground px-3 py-2.5 rounded-md w-full border">
            No in progress grants yet
          </span>
        )}
      </div>
      <div className="flex flex-col space-y-4">
        <h4 className="font-semibold text-text-default text-xl">Claimed</h4>
        {claimedRewards.length ? (
          <ul className="space-y-3">
            {claimedRewards.map((reward) => (
              <li key={reward.id}>
                <RewardAccordion
                  team={team}
                  reward={reward}
                  key={reward.id}
                  teamVerified={verifiedKycTeams[reward.projectId] ?? false}
                />
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-sm text-muted-foreground px-3 py-2.5 rounded-md w-full border">
            No claimed grants yet
          </span>
        )}
      </div>
    </div>
  )
}
