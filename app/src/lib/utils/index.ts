import { Organization, ProjectSnapshot } from "@prisma/client"
import { type ClassValue, clsx } from "clsx"
import { customAlphabet } from "nanoid"
import { sortBy } from "ramda"
import { twMerge } from "tailwind-merge"

import {
  ProjectContracts,
  ProjectWithDetails,
  ProjectWithFullDetails,
  UserWithAddresses,
} from "../types"

export const APPLICATIONS_CLOSED =
  process.env.NEXT_PUBLIC_APPLICATIONS_CLOSED === "true"

export const DISCORD_REDIRECT_COOKIE = "discord-auth-redirect"
export const GITHUB_REDIRECT_COOKIE = "github-auth-redirect"

export const EAS_URL_PREFIX =
  process.env.NEXT_PUBLIC_ENV === "dev"
    ? "https://sepolia.easscan.org/attestation/view/"
    : "https://optimism.easscan.org/attestation/view/"

export const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  10,
)

export function formatNumber(
  amount: string | number,
  maximumSignificantDigits = 2,
) {
  const numberFormat = new Intl.NumberFormat("en", {
    notation: "standard",
    maximumFractionDigits: maximumSignificantDigits,
  })

  return numberFormat.format(Number(amount))
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function titlecase(str: string) {
  return str.charAt(0).toLocaleUpperCase() + str.slice(1)
}

export const copyToClipboard = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
  } catch (error) {
    throw new Error("Failed to copy text to clipboard")
  }
}

const LAST_SIGN_IN_LOCALSTORAGE_KEY = "op_atlas_last_signed_in"
const WELCOME_BADGEHOLDER_DIALOG_LOCALSTORAGE_KEY =
  "op_atlas_welcome_badgeholder_dialog_shown"
const NO_REWARDS_DIALOG_LOCALSTORAGE_KEY = "op_atlas_no_rewards_dialog_shown"

export function isFirstTimeUser(): boolean {
  return !Boolean(localStorage.getItem(LAST_SIGN_IN_LOCALSTORAGE_KEY))
}

export function saveLogInDate() {
  localStorage.setItem(LAST_SIGN_IN_LOCALSTORAGE_KEY, Date.now().toString())
}

export function hasShownWelcomeBadgeholderDialog(): boolean {
  return Boolean(
    localStorage.getItem(WELCOME_BADGEHOLDER_DIALOG_LOCALSTORAGE_KEY),
  )
}

export function saveHasShownWelcomeBadgeholderDialog() {
  localStorage.setItem(WELCOME_BADGEHOLDER_DIALOG_LOCALSTORAGE_KEY, "true")
}

export function hasShownNoRewardsDialog(): boolean {
  return Boolean(localStorage.getItem(NO_REWARDS_DIALOG_LOCALSTORAGE_KEY))
}

export function saveHasShownNoRewardsDialog() {
  localStorage.setItem(NO_REWARDS_DIALOG_LOCALSTORAGE_KEY, "true")
}

export enum ProjectSection {
  Details = "Details",
  Contributors = "Contributors",
  Repos = "Repos",
  Contracts = "Contracts",
  Grants = "Grants",
  Publish = "Publish",
}

export type ProjectStatus = {
  completedSections: ProjectSection[]
  progressPercent: number
}

export function getProjectStatus(
  project: ProjectWithFullDetails | null,
  contracts: ProjectContracts | null,
): ProjectStatus {
  const completedSections: ProjectSection[] = []

  if (!project) return { completedSections, progressPercent: 0 }

  const hasDetails = project.name && project.description
  if (hasDetails) {
    completedSections.push(ProjectSection.Details)
  }

  const hasTeam = project.addedTeamMembers
  if (hasTeam) {
    completedSections.push(ProjectSection.Contributors)
  }

  const hasRepos =
    project.repos.filter((r) => r.type === "github" && r.verified).length > 0 ||
    project.hasCodeRepositories === false
  if (hasRepos) {
    completedSections.push(ProjectSection.Repos)
  }

  const hasContracts =
    (contracts && contracts?.contracts.length > 0) ||
    !!project.openSourceObserverSlug ||
    project.isOnChainContract === false
  if (hasContracts) {
    completedSections.push(ProjectSection.Contracts)
  }

  const hasFunding =
    (project.funding.length > 0 || project.addedFunding) && project.pricingModel
  if (hasFunding) {
    completedSections.push(ProjectSection.Grants)
  }

  const hasUnpublishedChanges = projectHasUnpublishedChanges(
    project.snapshots,
    project.lastMetadataUpdate,
  )
  if (!hasUnpublishedChanges) {
    completedSections.push(ProjectSection.Publish)
  }

  let progress = hasDetails ? 16.67 : 0
  progress += hasTeam ? 16.67 : 0
  progress += hasRepos ? 16.67 : 0
  progress += hasContracts ? 16.67 : 0
  progress += hasFunding ? 16.67 : 0
  progress += !hasUnpublishedChanges ? 16.67 : 0

  return { completedSections, progressPercent: Math.round(progress) }
}

export function projectHasUnpublishedChanges(
  snapshots: ProjectSnapshot[],
  lastMetadataUpdate: Date,
): boolean {
  const latestSnapshot = sortBy(
    (s) => -new Date(s.createdAt).getTime(),
    snapshots,
  )[0]
  if (!latestSnapshot) return true

  return new Date(latestSnapshot.createdAt) < new Date(lastMetadataUpdate)
}

/*
  Ultra jank way to mock clicking on the Farcaster button because SignInButton doesn't
  accept an id or className argument :/
*/
export function clickSignInWithFarcasterButton() {
  const farcasterButton = document
    .getElementsByClassName("fc-authkit-signin-button")[0]
    ?.getElementsByTagName("button")[0]
  farcasterButton?.click()
}

export function profileProgress(user: UserWithAddresses): number {
  // Define the number of steps dynamically
  const numberOfSteps = 4
  const step = 100 / numberOfSteps

  let progress = 0

  if (user.emails.length > 0) {
    progress += step
  }

  if (user.github || user.notDeveloper) {
    progress += step
  }

  if (user.addresses.length > 1) {
    progress += step
  }

  if (user.addresses.some((addr) => addr.primary)) {
    progress += step
  }

  // If all conditions are met, return 100
  return progress === 100 ? 100 : progress
}

export function shortenAddress(address: string) {
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4,
    address.length,
  )}`
}

export function isOrganizationSetupComplete(organization: Organization) {
  return (
    organization.name &&
    organization.description &&
    organization.avatarUrl &&
    organization.coverUrl
  )
}

export function arrayDifference(arr1: string[], arr2: string[]) {
  const set2 = new Set(arr2)
  return arr1.filter((item) => !set2.has(item))
}

export const getValidUntil = (value: Date) => {
  return new Date(
    new Date(value).setFullYear(new Date(value).getFullYear() + 1),
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
