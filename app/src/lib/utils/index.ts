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

export const formatNumberWithCommas = (value: string | number) => {
  if (typeof value === "string") {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  return array.reduce((acc, _, i) => {
    if (i % size === 0) {
      acc.push(array.slice(i, i + size))
    }
    return acc
  }, [] as T[][])
}

export function abbreviateNumber(n: number) {
  if (n === 0) return "- -"
  if (n < 1e3) return n
  if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K"
  if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M"
  if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B"
  if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T"

  return n
}

export function formatNumberWithSeparator(
  value: number | string,
  {
    separator = ",",
    decimals = 0,
    round = true,
  }: {
    separator?: "," | "." | " "
    decimals?: number
    round?: boolean
  } = {},
): string {
  let num = typeof value === "string" ? parseFloat(value) : value

  if (round && typeof decimals === "number") {
    num = parseFloat(num.toFixed(decimals))
  }

  const [intPart, decimalPart] = num.toString().split(".")
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator)

  if (typeof decimals === "number") {
    const fixedDecimal = (decimalPart || "")
      .padEnd(decimals, "0")
      .slice(0, decimals)
    return decimals > 0 ? `${formattedInt}.${fixedDecimal}` : formattedInt
  }

  return decimalPart ? `${formattedInt}.${decimalPart}` : formattedInt
}

type Trend = { value: number; sign: "inc" | "dec" | null }

type MetricResult = {
  value: number
  trend: Trend
}

type MonthlyMetrics = Record<string, Record<string, MetricResult>>

export function generateMonthlyMetrics(
  data: Record<string, Record<string, number[]>>,
  months: string[],
): MonthlyMetrics {
  const sum = (arr?: number[]) => arr?.reduce((acc, val) => acc + val, 0) || 0

  const getTrend = (current: number, previous: number): Trend => {
    if (previous === 0) return { value: 0, sign: null }

    const diff = current - previous
    const percentageChange = Math.abs((diff / previous) * 100)

    return {
      value: parseFloat(percentageChange.toFixed(2)),
      sign: diff > 0 ? "inc" : diff < 0 ? "dec" : null,
    }
  }

  const metricKeys = Object.keys(data)

  return months.reduce((acc, month, index) => {
    const prevMonth = months[index - 1]

    acc[month] = metricKeys.reduce((metricAcc, key) => {
      const currentValue = sum(data[key]?.[month])
      const previousValue = index === 0 ? 0 : sum(data[key]?.[prevMonth])

      metricAcc[key] = {
        value: currentValue,
        trend: getTrend(currentValue, previousValue),
      }

      return metricAcc
    }, {} as Record<string, MetricResult>)

    return acc
  }, {} as MonthlyMetrics)
}

export function truncateString(
  str: string,
  maxLength: number,
  suffix = "...",
): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + suffix
}
