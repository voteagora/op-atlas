import { type ClassValue, clsx } from "clsx"
import { customAlphabet } from "nanoid"
import { twMerge } from "tailwind-merge"

import { ProjectWithDetails } from "../types"

export const EAS_URL_PREFIX = "https://optimism.easscan.org/attestation/view/"

export const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  10,
)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function titlecase(str: string) {
  return str.charAt(0).toLocaleUpperCase() + str.slice(1)
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
  Publish = "Publish",
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

  const hasTeam = project.team.length > 1 && project.addedTeamMembers
  if (hasTeam) {
    completedSections.push(ProjectSection.Team)
  }

  const hasRepos =
    project.repos.filter((r) => r.type === "github" && r.verified).length > 0
  if (hasRepos) {
    completedSections.push(ProjectSection.Repos)
  }

  const hasContracts =
    project.contracts.length > 0 || !!project.openSourceObserverSlug
  if (hasContracts) {
    completedSections.push(ProjectSection.Contracts)
  }

  const hasFunding = project.funding.length > 0 || project.addedFunding
  if (hasFunding) {
    completedSections.push(ProjectSection.Grants)
  }

  const hasSnapshots = project.snapshots.length > 0
  if (hasSnapshots) {
    completedSections.push(ProjectSection.Publish)
  }

  let progress = hasDetails ? 16.67 : 0
  progress += hasTeam ? 16.67 : 0
  progress += hasRepos ? 16.67 : 0
  progress += hasContracts ? 16.67 : 0
  progress += hasFunding ? 16.67 : 0
  progress += hasSnapshots ? 16.67 : 0

  return { completedSections, progressPercent: Math.round(progress) }
}