"use client"

import { REWARD_CLAIM_STATUS } from "@/lib/constants"
import { useIsAdmin } from "@/lib/hooks"
import { ProjectTeam, ProjectWithFullDetails } from "@/lib/types"
import { RecurringRewardsByRound } from "@/lib/utils/rewards"

import RecurringRewardAccordion from "./RecurringRewardAccordion"
import RewardAccordion from "./RewardAccordion"

export function RewardsSection({
  team,
  project,
  recurringRewards,
}: {
  team: ProjectTeam
  project: ProjectWithFullDetails
  recurringRewards: RecurringRewardsByRound[]
}) {
  const isAdmin = useIsAdmin(team)

  const hasRewards = project.rewards.length > 0 || recurringRewards.length > 0

  const inProgressRewards = project.rewards.filter(
    (reward) =>
      reward.roundId !== "7" &&
      reward.roundId !== "8" &&
      reward.claim?.status !== REWARD_CLAIM_STATUS.EXPIRED &&
      reward.claim?.status !== REWARD_CLAIM_STATUS.CLAIMED &&
      reward.claim?.status !== REWARD_CLAIM_STATUS.REJECTED,
  )

  const claimedRewards = project.rewards.filter(
    (reward) => reward.claim?.status === REWARD_CLAIM_STATUS.CLAIMED,
  )

  const expiredRewards = project.rewards.filter(
    (reward) => reward.claim?.status === REWARD_CLAIM_STATUS.EXPIRED,
  )

  const renderClaimedRewards = () => {
    if (claimedRewards.length) {
      return (
        <div className="flex flex-col space-y-4">
          <h4 className="font-semibold text-text-default text-xl">Claimed</h4>
          <ul className="space-y-3">
            {claimedRewards.map((reward) => (
              <li key={reward.id}>
                <RewardAccordion reward={reward} />
              </li>
            ))}
          </ul>
        </div>
      )
    }
  }

  const renderExpiredRewards = () => {
    if (expiredRewards.length) {
      return (
        <div className="flex flex-col space-y-4">
          <h4 className="font-semibold text-text-default text-xl">Expired</h4>
          <ul className="space-y-3">
            {expiredRewards.map((reward) => (
              <li key={reward.id}>
                <RewardAccordion reward={reward} />
              </li>
            ))}
          </ul>
        </div>
      )
    }
  }

  const renderInProgressRewards = () => {
    return (
      <div className="flex flex-col space-y-4">
        <h4 className="font-semibold text-text-default text-xl">Unclaimed</h4>
        {inProgressRewards.length || recurringRewards.length ? (
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
                <RewardAccordion reward={reward} key={reward.id} />
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-sm text-muted-foreground px-3 py-2.5 rounded-md w-full border">
            No in progress grants yet
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-12">
      <div className="space-y-6">
        <h2 className="text-2xl text-text-default font-semibold">Rewards</h2>
        <p className="text-secondary-foreground text-base font-normal">
          {hasRewards
            ? "Grant recipients have one year to claim their Retro Funding rewards. Unclaimed tokens will no longer be available after their expiration date."
            : "If this project receives any Retro Funding, we'll record it here."}
        </p>
      </div>
      {hasRewards && (
        <>
          {renderInProgressRewards()}
          {renderClaimedRewards()}
          {renderExpiredRewards()}
        </>
      )}
    </div>
  )
}
