import { ProjectWithDetails, RewardWithClaim } from "./types"

export function unclaimedRewards(project: ProjectWithDetails) {
  return project.rewards.map(
    (reward) => !reward.claim || reward.claim.status !== "claimed",
  )
}

export function unclaimedReward(reward: RewardWithClaim) {
  return !reward.claim || reward.claim.status !== "claimed"
}

export function noRewards(project: ProjectWithDetails) {
  return project.rewards.length === 0
}

export function noRewardsPriorToRound(
  project: ProjectWithDetails,
  roundId: number,
) {
  return !project.rewards.some((reward) => parseInt(reward.roundId) < roundId)
}

// for every project
// for every reward
// check that every reward is either claimed, or not a part of this round
export function noRewardsForRound(
  projects: ProjectWithDetails[],
  roundId: string,
) {
  return projects.every((project) =>
    project.rewards.every(
      (reward) =>
        reward.roundId !== roundId || reward.claim?.status === "claimed",
    ),
  )
}
