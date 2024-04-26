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

export function getProjectStatus(project: ProjectWithDetails) {
  const hasDetails =
    project.name &&
    project.description &&
    project.thumbnailUrl &&
    project.bannerUrl

  const hasTeam = project.team?.length > 1
  const hasRepos = project.repos?.length > 0
  const hasContracts = project.contracts?.length > 0
  const hasFunding = project.funding?.length > 0

  let progress = hasDetails ? 20 : 0
  progress += hasTeam ? 20 : 0
  progress += hasRepos ? 20 : 0
  progress += hasContracts ? 20 : 0
  progress += hasFunding ? 20 : 0

  return progress
}
