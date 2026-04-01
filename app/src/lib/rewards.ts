import { RewardWithClaim } from "./types"

type RewardBearingProject = {
  rewards: Array<{
    roundId: string | null
    claim: {
      status: string | null
    } | null
  }>
}

export function unclaimedRewards(project: RewardBearingProject) {
  return project.rewards.map(
    (reward) => !reward.claim || reward.claim.status !== "claimed",
  )
}

export function unclaimedReward(reward: RewardWithClaim) {
  return !reward.claim || reward.claim.status !== "claimed"
}

export function noRewards(project: RewardBearingProject) {
  return project.rewards.length === 0
}

export function noRewardsPriorToRound(
  project: RewardBearingProject,
  roundId: number,
) {
  return !project.rewards.some(
    (reward) =>
      typeof reward.roundId === "string" && parseInt(reward.roundId) < roundId,
  )
}

// for every project
// for every reward
// check that every reward is either claimed, or not a part of this round
export function noRewardsForRound(
  projects: RewardBearingProject[],
  roundId: string,
) {
  return projects.every((project) =>
    project.rewards.every(
      (reward) =>
        reward.roundId !== roundId || reward.claim?.status === "claimed",
    ),
  )
}
