"use client"

import { useIsAdmin } from "@/lib/hooks"
import {
  KYCTeamWithTeam,
  ProjectTeam,
  ProjectWithFullDetails,
  RecurringRewardWithProject,
} from "@/lib/types"
import { isKycTeamVerified } from "@/lib/utils/kyc"

import RewardAccordion from "./RewardAccordion"
import {
  formatRecurringRewards,
  RecurringRewardsByRound,
} from "@/lib/utils/rewards"
import RecurringRewardAccordion from "./RecurringRewardAccordion"

export function RewardsSection({
  team,
  project,
  kycTeam,
  recurringRewards,
}: {
  team: ProjectTeam
  project: ProjectWithFullDetails
  kycTeam?: KYCTeamWithTeam
  recurringRewards: RecurringRewardsByRound[]
}) {
  const isAdmin = useIsAdmin(team)

  const isVerified = isKycTeamVerified(kycTeam)

  const inProgressRewards = project.rewards.filter(
    (reward) =>
      reward.roundId === "7" ||
      reward.roundId === "8" ||
      reward.claim?.status === "pending",
  )

  const claimedRewards = project.rewards.filter(
    (reward) => reward.claim?.status === "claimed",
  )

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
            {recurringRewards.map((reward) => {
              return (
                <li key={reward.roundId}>
                  <RecurringRewardAccordion
                    reward={reward}
                    isAdmin={Boolean(isAdmin)}
                  />
                </li>
              )
            })}

            {inProgressRewards.map((reward) => (
              <li key={reward.id}>
                <RewardAccordion
                  isAdmin={Boolean(isAdmin)}
                  reward={reward}
                  key={reward.id}
                  teamVerified={isVerified}
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
                  reward={reward}
                  key={reward.id}
                  teamVerified={isVerified}
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
