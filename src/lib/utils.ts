import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { ProjectWithDetails } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function titlecase(str: string) {
  return str.charAt(0).toLocaleUpperCase() + str.slice(1)
}

export function isValidGitHubRepoUrl(url: string) {
  // Regular expression to match GitHub repository URLs
  const githubRepoRegex =
    /^(https?:\/\/)?(www\.)?github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)$/

  // Test the URL against the regex
  return githubRepoRegex.test(url)
}

export const copyTextToClipBoard = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
  } catch (error) {
    throw new Error("Failed to copy text to clipboard")
  }
}

const LAST_SIGN_IN_LOCALSTORAGE_KEY = "op_atlas_last_signed_in"

export function isFirstTimeUser(): boolean {
  return !Boolean(localStorage.getItem(LAST_SIGN_IN_LOCALSTORAGE_KEY))
}

export function saveLogInDate() {
  localStorage.setItem(LAST_SIGN_IN_LOCALSTORAGE_KEY, Date.now().toString())
}

export enum ProjectSection {
  Details = "Details",
  Team = "Team",
  Repos = "Repos",
  Contracts = "Contracts",
  Grants = "Grants",
}
export type ProjectStatus = {
  completedSections: ProjectSection[]
  progressPercent: number
}
export function getProjectStatus(project: ProjectWithDetails): ProjectStatus {
  const completedSections: ProjectSection[] = []

  const hasDetails =
    project.name &&
    project.description &&
    project.thumbnailUrl &&
    project.bannerUrl
  if (hasDetails) {
    completedSections.push(ProjectSection.Details)
  }

  const hasTeam = project.team?.length > 1
  if (hasTeam) {
    completedSections.push(ProjectSection.Team)
  }

  const hasRepos = project.repos?.length > 0
  if (hasRepos) {
    completedSections.push(ProjectSection.Repos)
  }

  const hasContracts = project.contracts?.length > 0
  if (hasContracts) {
    completedSections.push(ProjectSection.Contracts)
  }

  const hasFunding = project.funding?.length > 0
  if (hasFunding) {
    completedSections.push(ProjectSection.Grants)
  }

  let progress = hasDetails ? 20 : 0
  progress += hasTeam ? 20 : 0
  progress += hasRepos ? 20 : 0
  progress += hasContracts ? 20 : 0
  progress += hasFunding ? 20 : 0

  return { completedSections, progressPercent: progress }
}
