import { ProjectWithDetails } from "./types"

export function unclaimedRewards(project: ProjectWithDetails) {
  return project.rewards.map(
    (reward) => !reward.claim || reward.claim.status !== "claimed",
  )
}

export function noRewards(projects: ProjectWithDetails[]) {
  return projects.every((project) => project.rewards.length === 0)
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
