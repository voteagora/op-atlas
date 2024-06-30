import { ProjectWithDetails } from "./types"

export function unclaimedRewards(project: ProjectWithDetails) {
  // TODO: use final enum here
  return project.rewards.map((reward) => reward.claim?.status === "cleared")
}

export function noRewards(projects: ProjectWithDetails[]) {
  return projects.every((project) => project.rewards.length === 0)
}
