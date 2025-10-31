"use server"

import {
  CitizenRegistrationStatus,
  citizenCategory,
  Prisma,
  SocialTrustPlatform,
} from "@prisma/client"

import { prisma } from "@/db/client"
import { getUserById, getUserWorldId } from "@/db/users"
import { getUserKYCUser } from "@/db/userKyc"
import {
  getCitizenSeasonByUser,
  findBlockedCitizenSeasonEvaluation,
  checkWalletEligibility as checkWalletEligibilityDb,
} from "@/db/citizenSeasons"
import { hasPriorityAttestation } from "@/lib/services/priorityAttestations"
import {
  evaluateTrustScores,
  serializeTrustScores,
  TrustEvaluationResult,
} from "@/lib/services/citizenTrust"
import {
  getActiveSeason,
  getSeasonOrThrow,
  hasRegistrationEnded,
  hasRegistrationStarted,
  isPriorityWindowOpen,
} from "@/lib/seasons"

export type S9QualificationInput = {
  userId: string
  governanceAddress?: string
  seasonId?: string
}

export type S9QualificationStatus =
  | "ALREADY_REGISTERED"
  | "PRIORITY_REQUIRED"
  | "REGISTRATION_CLOSED"
  | "NOT_ELIGIBLE"
  | "BLOCKED"
  | "NEEDS_VERIFICATION"
  | "READY"

export type S9QualificationResult = {
  status: S9QualificationStatus
  season: {
    id: string
    name: string
  }
  citizenType: citizenCategory
  kycApproved: boolean
  worldIdVerified: boolean
  hasGold: boolean
  hasPlatinum: boolean
  trust?: TrustEvaluationResult
  message?: string
  reason?: string
  evaluationId: string
  existingCitizen?: Awaited<ReturnType<typeof getCitizenSeasonByUser>>
}

export async function s9Qualification({
  userId,
  governanceAddress,
  seasonId,
}: S9QualificationInput): Promise<S9QualificationResult> {
  if (!userId) {
    throw new Error("User ID is required for S9 qualification")
  }

  const user = await getUserById(userId)
  if (!user) {
    throw new Error(`User ${userId} not found`)
  }

  const season =
    (seasonId && (await getSeasonOrThrow(seasonId))) ||
    (await getActiveSeason())

  if (!season) {
    throw new Error("No active season configured")
  }

  const seasonInfo = { id: season.id, name: season.name }
  const citizenType = citizenCategory.USER

  const wallets = extractUserWallets(user.addresses ?? [])
  const socialProfiles = buildSocialProfiles({
    farcasterId: user.farcasterId,
    github: user.github,
    twitter: user.twitter,
  })

  const [kycRecord, worldIdRecord] = await Promise.all([
    getUserKYCUser(userId),
    getUserWorldId(userId),
  ])

  const kycApproved = Boolean(
    kycRecord?.kycUser && kycRecord.kycUser.status === "APPROVED",
  )
  const worldIdVerified = Boolean(worldIdRecord?.verified)

  const existingCitizen = await getCitizenSeasonByUser({
    seasonId: season.id,
    userId,
  })
  const evaluationContext = {
    seasonId: season.id,
    userId,
    wallets,
    socials: socialProfiles,
  }

  const returnWithEvaluation = async ({
    status,
    outcome,
    message,
    reason,
    trust,
    hasGold = false,
    hasPlatinum = false,
    openRankRaw,
    passportRaw,
  }: {
    status: S9QualificationStatus
    outcome: CitizenRegistrationStatus
    message?: string
    reason?: string
    trust?: TrustEvaluationResult
    hasGold?: boolean
    hasPlatinum?: boolean
    openRankRaw?: unknown
    passportRaw?: unknown
  }): Promise<S9QualificationResult> => {
    const evaluation = await recordEvaluation({
      ...evaluationContext,
      outcome,
      openRankRaw,
      passportRaw,
    })

    return {
      status,
      season: seasonInfo,
      citizenType,
      kycApproved,
      worldIdVerified,
      hasGold,
      hasPlatinum,
      trust,
      message,
      reason,
      evaluationId: evaluation.id,
      existingCitizen,
    }
  }

  if (!hasRegistrationStarted(season)) {
    return returnWithEvaluation({
      status: "REGISTRATION_CLOSED",
      outcome: CitizenRegistrationStatus.ELIGIBILITY_FAILED,
      message: "Season registration has not started yet.",
    })
  }

  if (hasRegistrationEnded(season)) {
    return returnWithEvaluation({
      status: "REGISTRATION_CLOSED",
      outcome: CitizenRegistrationStatus.ELIGIBILITY_FAILED,
      message: "Season registration has ended.",
    })
  }

  if (existingCitizen) {
    return returnWithEvaluation({
      status: "ALREADY_REGISTERED",
      outcome: existingCitizen.registrationStatus,
      message: "You have already registered for this season.",
    })
  }

  const blockedEvaluation = await findBlockedCitizenSeasonEvaluation({
    seasonId: season.id,
    userId,
  })

  if (blockedEvaluation) {
    return {
      status: "BLOCKED",
      season: seasonInfo,
      citizenType,
      kycApproved,
      worldIdVerified,
      hasGold: false,
      hasPlatinum: false,
      message: `Your onchain activity disqualifies you from becoming a citizen in ${seasonInfo.name}.`,
      reason: "BLOCKED",
      evaluationId: blockedEvaluation.id,
      existingCitizen,
    }
  }

  const priorityOpen = isPriorityWindowOpen(season)
  if (priorityOpen) {
    const hasPriority = await hasPriorityAttestation({
      seasonId: season.id,
      addresses: wallets,
    })

    if (!hasPriority) {
      return returnWithEvaluation({
        status: "PRIORITY_REQUIRED",
        outcome: CitizenRegistrationStatus.ELIGIBILITY_FAILED,
        message:
          "A qualifying attestation is required to register during the priority window.",
      })
    }
  }

  if (wallets.length === 0) {
    return returnWithEvaluation({
      status: "NOT_ELIGIBLE",
      outcome: CitizenRegistrationStatus.ELIGIBILITY_FAILED,
      reason: "NO_WALLETS",
      message: "Link at least one wallet before registering.",
    })
  }

  const normalizedGovernance = governanceAddress?.toLowerCase()
  if (!normalizedGovernance) {
    return returnWithEvaluation({
      status: "NOT_ELIGIBLE",
      outcome: CitizenRegistrationStatus.ELIGIBILITY_FAILED,
      reason: "MISSING_GOVERNANCE_ADDRESS",
      message: "A governance address must be provided for registration.",
    })
  }

  if (!wallets.includes(normalizedGovernance)) {
    return returnWithEvaluation({
      status: "NOT_ELIGIBLE",
      outcome: CitizenRegistrationStatus.ELIGIBILITY_FAILED,
      reason: "INVALID_GOVERNANCE_ADDRESS",
      message: "Select a governance address from one of your linked wallets.",
    })
  }

  const userQualification = await evaluateUserQualification({
    seasonId: season.id,
    wallets,
  })

  if (!userQualification) {
    return returnWithEvaluation({
      status: "NOT_ELIGIBLE",
      outcome: CitizenRegistrationStatus.ELIGIBILITY_FAILED,
      reason: "INSUFFICIENT_ACTIVITY",
      message:
        "No qualifying wallets were found. Please try connecting other wallets.",
    })
  }

  if (kycApproved || worldIdVerified) {
    return returnWithEvaluation({
      status: "READY",
      outcome: CitizenRegistrationStatus.READY,
      message: "Identity verification already complete.",
      hasGold: true,
      hasPlatinum: true,
    })
  }

  const trust = await evaluateTrustScores({
    seasonId: season.id,
    userId,
    citizenType,
    wallets,
    socials: socialProfiles,
  })

  const { socialRaw, passportRaw } = serializeTrustScores(trust)

  if (trust.decision === "BLOCKED") {
    return returnWithEvaluation({
      status: "BLOCKED",
      outcome: CitizenRegistrationStatus.BLOCKED,
      reason: "BLOCKED",
      message:
        "Your onchain activity disqualifies you from citizenship for this season.",
      trust,
      hasGold: trust.hasGold,
      hasPlatinum: trust.hasPlatinum,
      openRankRaw: socialRaw,
      passportRaw,
    })
  }

  if (trust.decision === "NEEDS_VERIFICATION") {
    return returnWithEvaluation({
      status: "NEEDS_VERIFICATION",
      outcome: CitizenRegistrationStatus.VERIFICATION_REQUIRED,
      reason: "ADDITIONAL_VERIFICATION_REQUIRED",
      trust,
      hasGold: trust.hasGold,
      hasPlatinum: trust.hasPlatinum,
      openRankRaw: socialRaw,
      passportRaw,
    })
  }

  return returnWithEvaluation({
    status: "READY",
    outcome: CitizenRegistrationStatus.READY,
    trust,
    hasGold: trust.hasGold,
    hasPlatinum: trust.hasPlatinum,
    openRankRaw: socialRaw,
    passportRaw,
  })
}

async function evaluateUserQualification({
  seasonId,
  wallets,
}: {
  seasonId: string
  wallets: string[]
}): Promise<boolean> {
  if (wallets.length === 0) {
    return false
  }

  const normalizedWallets = wallets.map((address) => address.toLowerCase())

  const qualifying = await prisma.citizenQualifyingUser.findMany({
    where: {
      seasonId,
      address: {
        in: normalizedWallets,
      },
    },
  })

  return qualifying.length > 0
}

function extractUserWallets(
  addresses: Array<{ address: string }> = [],
): string[] {
  const unique = new Set<string>()

  for (const entry of addresses) {
    if (!entry?.address) continue
    unique.add(entry.address.toLowerCase())
  }

  return Array.from(unique)
}

function buildSocialProfiles({
  farcasterId,
  github,
  twitter,
}: {
  farcasterId?: string | null
  github?: string | null
  twitter?: string | null
}): Array<{ platform: SocialTrustPlatform; identifier: string }> {
  const socials: Array<{ platform: SocialTrustPlatform; identifier: string }> = []

  if (farcasterId) {
    socials.push({ platform: "FARCASTER", identifier: farcasterId })
  }

  if (github) {
    socials.push({ platform: "GITHUB", identifier: github })
  }

  if (twitter) {
    socials.push({ platform: "X", identifier: twitter })
  }

  return socials
}

type RecordEvaluationArgs = {
  seasonId: string
  userId: string
  wallets: string[]
  socials: Array<{ platform: SocialTrustPlatform; identifier: string }>
  openRankRaw?: unknown
  passportRaw?: unknown
  outcome: CitizenRegistrationStatus
}

async function recordEvaluation({
  seasonId,
  userId,
  wallets,
  socials,
  openRankRaw,
  passportRaw,
  outcome,
}: RecordEvaluationArgs) {
  const socialProfiles = socials.map(({ platform, identifier }) => ({
    platform,
    identifier,
  }))

  return prisma.citizenSeasonEvaluation.create({
    data: {
      seasonId,
      userId,
      wallets,
      socialProfiles: socialProfiles as Prisma.InputJsonValue,
      openRankRaw: (openRankRaw ?? []) as Prisma.InputJsonValue,
      passportRaw: (passportRaw ?? []) as Prisma.InputJsonValue,
      outcome,
    },
  })
}

export async function checkWalletEligibility(address: string): Promise<{
  address: string
  eligible: boolean
}> {
  const activeSeason = await getActiveSeason()
  if (!activeSeason) {
    return {
      address: address.toLowerCase(),
      eligible: false,
    }
  }

  const eligible = await checkWalletEligibilityDb(address, activeSeason.id)
  return {
    address: address.toLowerCase(),
    eligible,
  }
}
