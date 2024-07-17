import { ProjectWithDetails } from "./types"

export function unclaimedRewards(project: ProjectWithDetails) {
  return project.rewards.map(
    (reward) => !reward.claim || reward.claim.status !== "claimed",
  )
}

export function noRewards(projects: ProjectWithDetails[]) {
  return projects.every((project) => project.rewards.length === 0)
}
