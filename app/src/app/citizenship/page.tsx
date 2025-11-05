"use server"

import Link from "next/link"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import {
  citizenCategory,
  CitizenRegistrationStatus,
  KYCStatus,
  SocialTrustPlatform,
  PersonaStatus,
  Prisma,
} from "@prisma/client"
import { Link as LinkIcon } from "lucide-react"
import { randomUUID } from "node:crypto"

import { ChainAppRequirements } from "@/app/citizenship/components/ChainAppRequirements"
import { Sidebar } from "@/app/citizenship/components/Sidebar"
import { UserRequirements } from "@/app/citizenship/components/UserRequirements"
import { auth } from "@/auth"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { RegistrationCard, RegistrationCardState } from "@/app/citizenship/components/s9/RegistrationCard"
import { RegisteredCard } from "@/app/citizenship/components/s9/RegisteredCard"
import type { RegisteredCardContext } from "@/app/citizenship/components/s9/RegisteredCard"
import { LinkBox } from "@/components/common/LinkBox"
import { Badge } from "@/components/ui/badge"
import { getUserByAddress, getUserById } from "@/db/users"
import {
  checkCitizenshipLimit,
  getCitizen,
  s8CitizenshipQualification,
} from "@/lib/actions/citizens"
import { CITIZEN_TYPES } from "@/lib/constants"
import {
  getActiveSeason,
  hasRegistrationEnded,
  hasRegistrationStarted,
  isPriorityWindowOpen,
  SeasonWithConfig,
} from "@/lib/seasons"
import {
  countCitizenSeasons,
  getCitizenSeasonByUser,
  getCitizenSeasonsByGovernanceAddresses,
  findBlockedCitizenSeasonEvaluation,
} from "@/db/citizenSeasons"
import { hasPriorityAttestation } from "@/lib/services/priorityAttestations"
import { formatDateRange, formatDateLong } from "@/lib/utils/date"
import { truncateAddress } from "@/lib/utils/string"

import { AnalyticsTracker } from "./components/AnalyticsTracker"
import { SidebarActiveCitizen } from "./components/SidebarActiveCitizen"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { prisma } from "@/db/client"
import { fetchPassportScore } from "@/lib/integrations/humanPassport"
import { cn } from "@/lib/utils"
import { Farcaster, Github, XOptimism } from "@/components/icons/socials"

type S9CitizenSeason = NonNullable<Awaited<ReturnType<typeof getCitizenSeasonByUser>>>

type StatusTone =
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"

type OpenRankBand = "NONE" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"

const OPEN_RANK_BAND_THRESHOLDS = {
  BRONZE: 0.2,
  SILVER: 0.4,
  GOLD: 0.65,
  PLATINUM: 0.82,
} as const

const OPEN_RANK_TIER_OPTIONS = {
  bronze: {
    label: "Bronze",
    score: 0.25,
    band: "BRONZE" as OpenRankBand,
    buttonClass: "border-amber-700/50 text-amber-700 hover:bg-amber-500/10",
  },
  silver: {
    label: "Silver",
    score: 0.5,
    band: "SILVER" as OpenRankBand,
    buttonClass: "border-slate-400/60 text-slate-600 hover:bg-slate-300/10",
  },
  gold: {
    label: "Gold",
    score: 0.7,
    band: "GOLD" as OpenRankBand,
    buttonClass: "border-yellow-500/60 text-yellow-700 hover:bg-yellow-400/10",
  },
  platinum: {
    label: "Platinum",
    score: 0.9,
    band: "PLATINUM" as OpenRankBand,
    buttonClass: "border-sky-500/60 text-sky-700 hover:bg-sky-400/10",
  },
} as const

type OpenRankTierKey = keyof typeof OPEN_RANK_TIER_OPTIONS

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>
}) {
  const session = await auth()
  const userId = session?.user?.id

  const season = await getActiveSeason()

  if (season?.id === "9") {
    return await renderSeasonNinePage({
      userId,
      season,
      searchParams,
    })
  }

  if (!userId) {
    redirect("/")
  }

  const [user, citizen, qualification, isCitizenshipLimitReached] =
    await Promise.all([
      getUserById(userId),
      getCitizen({ type: CITIZEN_TYPES.user, id: userId }),
      s8CitizenshipQualification(userId),
      checkCitizenshipLimit(),
    ])

  if (!user) {
    redirect("/")
  }

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <div className="w-full mt-20 lg:max-w-6xl lg:mx-auto lg:px-0 lg:grid lg:grid-cols-3 lg:gap-x-16">
        <div className="lg:col-span-2 lg:mt-0">
          <div className="flex flex-col w-full max-w-6xl z-10">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Citizenship Registration</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <AnalyticsTracker qualification={qualification} />

            <div className="flex flex-col gap-y-8 mt-12">
              <div className="text-[36px] font-normal text-foreground">
                Citizenship Registration
              </div>
              <div className="border-b border-border-secondary w-full"></div>
              <div className="text-secondary-foreground">
                <div className="flex flex-col gap-y-6">
                  <div>
                    The Citizens&apos; House votes on decisions that shape the
                    direction of the Collective.
                  </div>
                  <div>Season 8 Citizens will:</div>
                  <ul className="list-disc list-inside">
                    <li>
                      Elect the{" "}
                      <span className="font-normal">
                        Developer Advisory Board
                      </span>
                      , tasked with reviewing{" "}
                      <span className="font-normal">Protocol Upgrades</span>
                    </li>
                    <li>
                      Have the opportunity to
                      <span className="font-normal"> override </span>
                      Protocol Upgrades
                    </li>
                    <li>
                      Approve the{" "}
                      <span className="font-normal">Collective Intent</span>{" "}
                      as well as{" "}
                      <span className="font-normal">
                        Retroactive Public Goods Funding mission budgets
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                {qualification?.type !== CITIZEN_TYPES.user && qualification ? (
                  <ChainAppRequirements
                    userId={userId}
                    qualification={qualification}
                  />
                ) : (
                  <UserRequirements
                    userId={userId}
                    qualification={qualification}
                  />
                )}
              </div>

              <div className="border-b border-border-secondary w-full"></div>
              <div className="text-secondary-foreground">
                Learn more about citizenship in{" "}
                <Link
                  href="https://community.optimism.io/citizens-house/citizen-house-overview"
                  target="_blank"
                  className="underline"
                >
                  Gov Docs: Citizens House
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div>
          {citizen?.attestationId && qualification ? (
            <SidebarActiveCitizen
              user={user}
              qualification={qualification}
              citizen={citizen}
            />
          ) : (
            <>
              {qualification && (
                <div>
                  {qualification.type !== CITIZEN_TYPES.user ? (
                    <Sidebar
                      user={user}
                      qualification={qualification}
                      redirectUrl={searchParams.redirectUrl}
                    />
                  ) : (
                    <div>
                      {isCitizenshipLimitReached ? (
                        <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
                          <div className="flex flex-col gap-2">
                            <div className="font-normal text-secondary-foreground">
                              Registration has closed
                            </div>
                            <div className="text-sm text-secondary-foreground">
                              Thanks for your interest, but the Citizens&apos;
                              House has reached it&apos;s maximum capacity.
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Sidebar
                          user={user}
                          qualification={qualification}
                          redirectUrl={searchParams.redirectUrl}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

async function renderSeasonNinePage({
  userId,
  season,
  searchParams,
}: {
  userId: string | undefined
  season: SeasonWithConfig
  searchParams: Record<string, string | undefined>
}) {
  const user = userId ? await getUserById(userId) : null

  const citizenSeason = user && userId ? await getCitizenSeasonByUser({
    seasonId: season.id,
    userId,
  }) : null

  const userWallets = user?.addresses
    .map((address) => address.address)
    .filter((addr): addr is string => Boolean(addr)) ?? []
  const normalizedUserWallets = userWallets.map((addr) => addr.toLowerCase())
  const hasVerifiedEmail = user?.emails.some((email) => email.verified) ?? false
  const priorityWindow = isPriorityWindowOpen(season)
  const registrationStarted = hasRegistrationStarted(season)
  const registrationEnded = hasRegistrationEnded(season)

  let managedCitizenSeason:
    | (Awaited<
        ReturnType<typeof getCitizenSeasonsByGovernanceAddresses>
      >[number])
    | null = null

  if (!citizenSeason && normalizedUserWallets.length > 0) {
    const citizenSeasonsForWallets =
      await getCitizenSeasonsByGovernanceAddresses({
        seasonId: season.id,
        addresses: normalizedUserWallets,
      })

    managedCitizenSeason =
      citizenSeasonsForWallets.find(
        (entry) => entry.organizationId !== null || entry.projectId !== null,
      ) ?? null
  }

  const [hasPriorityAccess, registeredCitizensCount, blockedEvaluation] = await Promise.all([
    priorityWindow && normalizedUserWallets.length > 0
      ? hasPriorityAttestation({
          seasonId: season.id,
          addresses: normalizedUserWallets,
        })
      : Promise.resolve(false),
    season.userCitizenLimit
      ? countCitizenSeasons({
          seasonId: season.id,
          type: citizenCategory.USER,
        })
      : Promise.resolve(0),
    userId ? findBlockedCitizenSeasonEvaluation({
      seasonId: season.id,
      userId,
    }) : Promise.resolve(null),
  ])

  const limitReached = season.userCitizenLimit
    ? registeredCitizensCount >= season.userCitizenLimit
    : false
  const isBlocked = Boolean(blockedEvaluation)
  const registrationOpen = registrationStarted && !registrationEnded && !limitReached
  const isOpenStatus = registrationStarted && !registrationEnded

  let registeredCardContext: RegisteredCardContext | null = null

  if (citizenSeason && user) {
    registeredCardContext = {
      kind: "user",
      citizenSeasonId: citizenSeason.id,
      user: {
        name: user.name ?? null,
        username: user.username ?? null,
        imageUrl: user.imageUrl ?? null,
      },
    }
  } else if (managedCitizenSeason) {
    const governanceAddress = managedCitizenSeason.governanceAddress ?? undefined
    const responsibleUserRecord =
      governanceAddress !== undefined
        ? await getUserByAddress(governanceAddress)
        : null

    const responsibleDisplayName =
      responsibleUserRecord?.name ??
      responsibleUserRecord?.username ??
      (governanceAddress ? truncateAddress(governanceAddress) : undefined)

    const responsibleHref =
      responsibleUserRecord?.username
        ? `/${responsibleUserRecord.username}`
        : governanceAddress
        ? `/u/${governanceAddress}`
        : undefined

    registeredCardContext = {
      kind: managedCitizenSeason.organizationId ? "organization" : "project",
      citizenSeasonId: managedCitizenSeason.id,
      entity: {
        name:
          managedCitizenSeason.organization?.name ??
          managedCitizenSeason.project?.name ??
          "This entity",
        imageUrl:
          managedCitizenSeason.organization?.avatarUrl ??
          managedCitizenSeason.project?.thumbnailUrl ??
          null,
      },
      responsibleUser: responsibleDisplayName
        ? {
            name: responsibleDisplayName,
            href: responsibleHref,
          }
        : undefined,
    }
  }

  const sidebarCardState = registeredCardContext
    ? null
    : determineRegistrationCardState({
      season,
      citizenSeason,
      hasVerifiedEmail,
      hasPriorityAccess,
      priorityWindow,
      registrationStarted,
      registrationEnded,
      registrationOpen,
      limitReached,
      isBlocked,
      isLoggedIn: Boolean(user),
    })

  const statusLabel = registrationOpen ? "Open" : "Closed"
  const registrationDateRange = formatDateRange(
    season.registrationStartDate,
    season.registrationEndDate,
  )

  return (
      <main className="flex flex-col flex-1 items-center pb-12 relative">
        <div className="w-full flex justify-center px-4 lg:px-0">
        <div className="w-full max-w-[1064px] mt-12 flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-[48px]">
          <div className="w-full lg:w-[712px] flex flex-col">
            <div className="flex flex-col">
              <Badge
                variant={isOpenStatus ? "statusOpen" : "statusClosed"}
                className="self-start"
              >
                {statusLabel}
              </Badge>

              <h1 className="mt-12 text-4xl font-semibold text-foreground">
                Citizen Registration for {season.name}
              </h1>

              <p className="mt-2 text-base text-secondary-foreground">
                {registrationDateRange}
              </p>

              <div className="mt-6 border-b border-border-secondary" />

              <div className="mt-6 space-y-6 text-base text-secondary-foreground">
                <p>
                  The Citizens&apos; House votes on decisions that shape the direction of the Collective. Please note that citizens from previous seasons are required to register again to continue serving in {season.name}.
                </p>
                <div>
                  <p>To register, you’ll first be asked to...</p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Connect at least one social app</li>
                    <li>Link at least one wallet with Superchain activity</li>
                  </ul>
                </div>
                <p>
                  Some users may be eligible after these steps. Others will be asked to verify identity via KYC or connect World ID.
                </p>
              </div>

              <div className="mt-12 text-xl font-semibold text-foreground">Learn more</div>

              <div className="mt-6">
                <LinkBox
                  href="https://community.optimism.io/citizens-house/citizen-house-overview"
                  icon={LinkIcon}
                >
                  Gov Docs: Citizens&apos; House
                </LinkBox>
              </div>

              {user && (
                <div className="mt-12">
                  <SeasonNineTestControls
                    userId={user.id}
                    seasonId={season.id}
                    hasBlockedEvaluation={isBlocked}
                    searchParams={searchParams}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="w-full lg:w-[304px] flex-shrink-0">
            {registeredCardContext ? (
              <RegisteredCard seasonName={season.name} context={registeredCardContext} />
            ) : sidebarCardState ? (
              <RegistrationCard state={sidebarCardState} userId={user?.id ?? null} season={season} />
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
}

const TEST_OPEN_RANK_MARKER = "__s9TestControlUserId"

async function SeasonNineTestControls({
  userId,
  seasonId,
  hasBlockedEvaluation,
  searchParams,
}: {
  userId: string
  seasonId: string
  hasBlockedEvaluation: boolean
  searchParams: Record<string, string | undefined>
}) {
  const [userRecord, seasonRecord] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          orderBy: {
            primary: "desc",
          },
        },
        emails: true,
        worldId: true,
        userKYCUsers: {
          include: {
            kycUser: true,
          },
        },
      },
    }),
    prisma.season.findUnique({
      where: { id: seasonId },
    }),
  ])

  if (!userRecord || !seasonRecord) {
    return null
  }

  const firstAddress = userRecord.addresses[0]?.address ?? null
  const normalizedAddresses = userRecord.addresses.map((entry) =>
    entry.address.toLowerCase(),
  )

  const [qualifyingEntries, priorityEntries, testSnapshots] = await Promise.all([
    normalizedAddresses.length
      ? prisma.citizenQualifyingUser.findMany({
          where: {
            seasonId,
            address: {
              in: normalizedAddresses,
            },
          },
        })
      : Promise.resolve([]),
    normalizedAddresses.length
      ? prisma.priorityAttestationSnapshot.findMany({
          where: {
            seasonId,
            address: {
              in: normalizedAddresses,
            },
          },
        })
      : Promise.resolve([]),
    prisma.openRankSnapshot.findMany({
      where: {
        seasonId,
        raw: {
          path: [TEST_OPEN_RANK_MARKER],
          equals: userId,
        },
      },
    }),
  ])

  const socials = collectUserSocials(userRecord)

  const hasQualifying = qualifyingEntries.length > 0
  const hasPriority = priorityEntries.length > 0
  const hasWorldId = Boolean(userRecord.worldId)
  const hasKyc = userRecord.userKYCUsers.length > 0
  const hasTestOpenRankSnapshots = testSnapshots.length > 0
  const canSeedWalletData = Boolean(firstAddress)
  const registrationWindowLabel = formatDateRange(
    seasonRecord.registrationStartDate,
    seasonRecord.registrationEndDate,
  )
  const priorityEndLabel = seasonRecord.priorityEndDate
    ? formatDateLong(seasonRecord.priorityEndDate)
    : "Not configured"
  const passportAddressResult = searchParams.passportAddress ?? null
  const passportStatusResult = searchParams.passportStatus ?? null
  const passportScoreResult = searchParams.passportScore ?? null
  const passportErrorResult = searchParams.passportError ?? null
  const passportFetchedAtResult = searchParams.passportFetchedAt ?? null

  const passportFetchedAtLabel =
    passportFetchedAtResult && !Number.isNaN(Date.parse(passportFetchedAtResult))
      ? `${formatDateLong(new Date(passportFetchedAtResult))} ${new Date(
          passportFetchedAtResult,
        ).toLocaleTimeString()}`
      : null
  const hasPassportResult =
    Boolean(passportErrorResult) ||
    Boolean(passportStatusResult) ||
    Boolean(passportScoreResult) ||
    Boolean(passportFetchedAtResult)

  const baseSearchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (!value) {
      continue
    }
    if (key.startsWith("passport")) {
      continue
    }
    baseSearchParams.set(key, value)
  }
  const baseSearchString = baseSearchParams.toString()

  const statusItems: Array<{
    label: string
    value: string
    tone: StatusTone
  }> = [
    {
      label: "Primary wallet",
      value: firstAddress ? truncateAddress(firstAddress) : "Missing",
      tone: firstAddress ? "success" : "danger",
    },
    {
      label: "Superchain qualifier",
      value: hasQualifying ? "Present" : "Missing",
      tone: hasQualifying ? "success" : "danger",
    },
    {
      label: "Priority snapshot",
      value: hasPriority ? "Present" : "Missing",
      tone: hasPriority ? "success" : "warning",
    },
    {
      label: "World ID verification",
      value: hasWorldId ? "Present" : "Missing",
      tone: hasWorldId ? "success" : "warning",
    },
    {
      label: "KYC approval",
      value: hasKyc ? "Present" : "Missing",
      tone: hasKyc ? "success" : "warning",
    },
    {
      label: "Evaluation outcome",
      value: hasBlockedEvaluation ? "Blocked" : "Clear",
      tone: hasBlockedEvaluation ? "danger" : "success",
    },
  ]

  const normalizedSocials = socials.map((social) => ({
    ...social,
    normalizedIdentifier: normalizeIdentifier(social.identifier),
  }))

  const snapshotMap = new Map(
    testSnapshots.map((snapshot) => [
      `${snapshot.platform}:${snapshot.identifier}`,
      snapshot,
    ]),
  )

  const openRankTierEntries = Object.entries(OPEN_RANK_TIER_OPTIONS) as Array<
    [
      OpenRankTierKey,
      (typeof OPEN_RANK_TIER_OPTIONS)[OpenRankTierKey],
    ]
  >

  return (
    <div className="rounded-lg border border-border-secondary bg-background p-6">
      <div className="text-sm font-semibold text-foreground">
        Season 9 Test Controls
      </div>
      <p className="mt-1 text-sm text-secondary-foreground">
        Use these helpers to stage fake registration data for Season 9 on your account.
      </p>
      {!canSeedWalletData ? (
        <p className="mt-3 text-sm text-destructive">
          Add at least one wallet to your profile to enable wallet-based actions.
        </p>
      ) : null}
      <div className="mt-4 rounded-md border border-border-secondary/80 bg-secondary/10 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground/80">
          Current status
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {statusItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-md border border-border-secondary/60 bg-background px-3 py-2"
            >
              <span className="text-xs font-medium text-secondary-foreground">
                {item.label}
              </span>
              <span className={statusBadgeClass(item.tone)}>{item.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-border-secondary/60 pt-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground/80">
            Social trust snapshots
          </div>
          {normalizedSocials.length ? (
            <div className="mt-2 space-y-2">
              {normalizedSocials.map((social) => {
                const key = `${social.platform}:${social.normalizedIdentifier}`
                const snapshot = snapshotMap.get(key)
                const band = calculateOpenRankBand(snapshot?.score ?? null)
                const tone = mapBandToTone(band)
                const scoreLabel =
                  snapshot?.score !== null && snapshot?.score !== undefined
                    ? snapshot.score.toFixed(2)
                    : null
                return (
                  <div
                    key={`${social.platform}-${social.identifier}`}
                    className="flex items-center justify-between rounded-md border border-border-secondary/60 bg-background px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      {renderSocialIcon(social.platform)}
                      <span className="text-xs font-medium text-secondary-foreground">
                        {social.identifier}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={statusBadgeClass(tone)}>
                        {formatOpenRankBandLabel(band)}
                      </span>
                      {scoreLabel ? (
                        <span className="text-[10px] text-muted-foreground">
                          {scoreLabel}
                        </span>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="mt-2 text-xs text-secondary-foreground">
              Connect X, Farcaster, or GitHub to enable social trust testing.
            </p>
          )}
        </div>
        <div className="mt-3 text-xs text-secondary-foreground">
          <div>Registration window: {registrationWindowLabel}</div>
          <div>Priority phase ends: {priorityEndLabel}</div>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2 rounded-md border border-border-secondary/60 p-3">
          <form action={checkPassportScoreAction} className="flex flex-col gap-2">
            <input type="hidden" name="userId" value={userId} />
            <input type="hidden" name="existingSearch" value={baseSearchString} />
            <label
              htmlFor="passport-wallet-input"
              className="text-xs font-medium text-secondary-foreground"
            >
              Check Human Passport score for any wallet
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="passport-wallet-input"
                name="walletAddress"
                placeholder="0x..."
                defaultValue={passportAddressResult ?? ""}
                spellCheck={false}
                autoComplete="off"
                className="sm:flex-1"
              />
              <Button type="submit" variant="outline" className="sm:w-auto">
                Fetch score
              </Button>
            </div>
          </form>
          {hasPassportResult ? (
            <div className="flex flex-col gap-1 rounded-md bg-secondary/20 px-3 py-2 text-xs text-secondary-foreground">
              {passportAddressResult ? (
                <div>
                  <span className="font-medium">Wallet:</span>{" "}
                  <span className="font-mono">{passportAddressResult}</span>
                </div>
              ) : null}
              {passportStatusResult ? (
                <div>
                  <span className="font-medium">Status:</span> {passportStatusResult}
                </div>
              ) : null}
              {passportScoreResult ? (
                <div>
                  <span className="font-medium">Score:</span> {passportScoreResult}
                </div>
              ) : null}
              {passportFetchedAtLabel ? (
                <div>
                  <span className="font-medium">Fetched:</span> {passportFetchedAtLabel}
                </div>
              ) : null}
              {passportErrorResult ? (
                <div className="text-destructive">
                  <span className="font-medium">Error:</span> {passportErrorResult}
                </div>
              ) : null}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              Submit any address to retrieve its latest Passport score using the live integration.
            </span>
          )}
        </div>
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground/80">
            Registration timeline
          </h3>
          <p className="text-xs text-muted-foreground">
            Jump between registration phases while keeping five days of runway in each window.
          </p>
          <div className="flex flex-wrap gap-2">
            <form action={setSeasonToPriorityPhase} className="flex">
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="seasonId" value={seasonId} />
              <Button type="submit" variant="outline">
                Enter priority-only phase (+5 days)
              </Button>
            </form>
            <form action={setSeasonToGeneralPhase} className="flex">
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="seasonId" value={seasonId} />
              <Button type="submit" variant="outline">
                Enter general registration (+5 days)
              </Button>
            </form>
          </div>
        </section>
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground/80">
            Season data seeds
          </h3>
          <p className="text-xs text-muted-foreground">
            Reset or populate the minimum eligibility data for this user.
          </p>
          <div className="flex flex-wrap gap-2">
            <form action={clearSeasonNineData} className="flex">
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="seasonId" value={seasonId} />
              <Button type="submit" variant="outline">
                Clear S9 registration data
              </Button>
            </form>
            <form action={addQualifyingUserEntry} className="flex">
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="seasonId" value={seasonId} />
              <Button
                type="submit"
                variant="outline"
                disabled={!canSeedWalletData}
              >
                Seed Superchain qualifier
              </Button>
            </form>
            <form action={addPrioritySnapshotEntry} className="flex">
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="seasonId" value={seasonId} />
              <Button
                type="submit"
                variant="outline"
                disabled={!canSeedWalletData}
              >
                Seed priority access
              </Button>
            </form>
            <form action={addBlockedEvaluationRecord} className="flex">
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="seasonId" value={seasonId} />
              <Button type="submit" variant="outline">
                Create blocked evaluation snapshot
              </Button>
            </form>
          </div>
        </section>
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground/80">
            Identity toggles
          </h3>
          <p className="text-xs text-muted-foreground">
            Quickly add or remove proof-of-personhood requirements.
          </p>
          <div className="flex flex-wrap gap-2">
            <form action={toggleWorldIdVerification} className="flex">
              <input type="hidden" name="userId" value={userId} />
              <Button type="submit" variant="outline">
                {hasWorldId
                  ? "Remove fake World ID verification"
                  : "Add fake World ID verification"}
              </Button>
            </form>
            <form action={toggleKycRecord} className="flex">
              <input type="hidden" name="userId" value={userId} />
              <Button type="submit" variant="outline">
                {hasKyc ? "Remove fake KYC approval" : "Add fake KYC approval"}
              </Button>
            </form>
          </div>
        </section>
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground/80">
            Social trust snapshots
          </h3>
          <p className="text-xs text-muted-foreground">
            Tune OpenRank scores per social handle using tiered presets.
          </p>
          {normalizedSocials.length ? (
            <div className="flex flex-col gap-3">
              {normalizedSocials.map((social) => {
                const key = `${social.platform}:${social.normalizedIdentifier}`
                const snapshot = snapshotMap.get(key)
                const band = calculateOpenRankBand(snapshot?.score ?? null)
                const tone = mapBandToTone(band)
                const scoreLabel =
                  snapshot?.score !== null && snapshot?.score !== undefined
                    ? snapshot.score.toFixed(2)
                    : null

                return (
                  <div
                    key={`${social.platform}-${social.identifier}-controls`}
                    className="rounded-md border border-border-secondary/60 bg-background p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {renderSocialIcon(social.platform)}
                        <span className="text-sm font-medium text-secondary-foreground">
                          {social.identifier}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={statusBadgeClass(tone)}>
                          {formatOpenRankBandLabel(band)}
                        </span>
                        {scoreLabel ? (
                          <span className="text-[10px] text-muted-foreground">
                            {scoreLabel}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {openRankTierEntries.map(([tierKey, tierConfig]) => (
                        <form
                          key={`${social.platform}-${social.identifier}-${tierKey}`}
                          action={addOpenRankSnapshotsRecord}
                          className="flex"
                        >
                          <input type="hidden" name="userId" value={userId} />
                          <input type="hidden" name="seasonId" value={seasonId} />
                          <input type="hidden" name="platform" value={social.platform} />
                          <input
                            type="hidden"
                            name="identifier"
                            value={social.identifier}
                          />
                          <input type="hidden" name="variant" value={tierKey} />
                          <Button
                            type="submit"
                            variant="outline"
                            className={cn("sm:w-auto", tierConfig.buttonClass)}
                            disabled={band === tierConfig.band}
                          >
                            {tierConfig.label}
                          </Button>
                        </form>
                      ))}
                      <form action={removeOpenRankSnapshotsRecord} className="flex">
                        <input type="hidden" name="userId" value={userId} />
                        <input type="hidden" name="seasonId" value={seasonId} />
                        <input type="hidden" name="platform" value={social.platform} />
                        <input
                          type="hidden"
                          name="identifier"
                          value={social.identifier}
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="border-border-secondary/60 text-secondary-foreground hover:bg-secondary/20"
                          disabled={band === "NONE"}
                        >
                          Clear
                        </Button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-secondary-foreground">
              Connect a social account to unlock OpenRank snapshot helpers.
            </p>
          )}
          <form action={removeOpenRankSnapshotsRecord} className="mt-3 flex">
            <input type="hidden" name="userId" value={userId} />
            <input type="hidden" name="seasonId" value={seasonId} />
            <Button
              type="submit"
              variant="outline"
              className="border-border-secondary/60 text-secondary-foreground hover:bg-secondary/20"
              disabled={!hasTestOpenRankSnapshots}
            >
              Remove all test OpenRank snapshots
            </Button>
          </form>
        </section>
      </div>
      {normalizedSocials.length ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-secondary-foreground">
            Connected socials:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {normalizedSocials.map((social) => (
              <div
                key={`${social.platform}-${social.identifier}-badge`}
                className="inline-flex items-center gap-1 rounded-full border border-border-secondary/60 bg-background px-2 py-1"
              >
                {renderSocialIcon(social.platform)}
                <span className="text-[11px] text-secondary-foreground">
                  {social.identifier}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-secondary-foreground">
          No supported socials connected (X, Farcaster, GitHub).
        </p>
      )}
    </div>
  )
}

async function setSeasonToPriorityPhase(formData: FormData) {
  "use server"

  const userId = String(formData.get("userId") ?? "")
  const seasonId = String(formData.get("seasonId") ?? "")

  if (!userId || !seasonId) {
    throw new Error("Missing parameters for season adjustment")
  }

  await ensureCurrentUser(userId)

  const now = new Date()
  const registrationStartDate = new Date(now.getTime() - 60 * 60 * 1000)
  const priorityEndDate = addDays(now, 5)
  const registrationEndDate = addDays(priorityEndDate, 5)

  await prisma.season.update({
    where: { id: seasonId },
    data: {
      startDate: registrationStartDate,
      registrationStartDate,
      priorityEndDate,
      registrationEndDate,
      endDate: registrationEndDate,
    },
  })

  await revalidatePath("/citizenship")
}

async function setSeasonToGeneralPhase(formData: FormData) {
  "use server"

  const userId = String(formData.get("userId") ?? "")
  const seasonId = String(formData.get("seasonId") ?? "")

  if (!userId || !seasonId) {
    throw new Error("Missing parameters for season adjustment")
  }

  await ensureCurrentUser(userId)

  const now = new Date()
  const registrationStartDate = addDays(now, -7)
  const priorityEndDate = new Date(now.getTime() - 60 * 60 * 1000)
  const registrationEndDate = addDays(now, 5)

  await prisma.season.update({
    where: { id: seasonId },
    data: {
      startDate: registrationStartDate,
      registrationStartDate,
      priorityEndDate,
      registrationEndDate,
      endDate: addDays(registrationEndDate, 5),
    },
  })

  await revalidatePath("/citizenship")
}

async function checkPassportScoreAction(formData: FormData) {
  "use server"

  const userId = String(formData.get("userId") ?? "")
  const walletAddressRaw = String(formData.get("walletAddress") ?? "").trim()
  const existingSearch = String(formData.get("existingSearch") ?? "")

  if (!userId) {
    throw new Error("Missing userId for passport lookup")
  }

  await ensureCurrentUser(userId)

  const params = new URLSearchParams(existingSearch)
  const keysToReset = [
    "passportAddress",
    "passportStatus",
    "passportScore",
    "passportError",
    "passportFetchedAt",
  ]
  keysToReset.forEach((key) => params.delete(key))

  if (!walletAddressRaw) {
    params.set("passportError", "Please provide a wallet address.")
    redirectWithParams(params)
  }

  const passportResult = await fetchPassportScore({
    address: walletAddressRaw,
  })

  params.set("passportAddress", passportResult.address)
  params.set("passportStatus", passportResult.status)
  params.set("passportFetchedAt", passportResult.fetchedAt.toISOString())

  if (passportResult.score !== null) {
    params.set("passportScore", passportResult.score.toString())
  }

  if (passportResult.error) {
    params.set("passportError", passportResult.error)
  }

  redirectWithParams(params)
}

async function clearSeasonNineData(formData: FormData) {
  "use server"

  const userId = String(formData.get("userId") ?? "")
  const seasonId = String(formData.get("seasonId") ?? "")

  if (!userId || !seasonId) {
    throw new Error("Missing parameters for clearing Season 9 data")
  }

  await ensureCurrentUser(userId)

  const user = await fetchUserForTesting(userId)
  const { normalized, allVariants } = extractAddressVariants(user.addresses)

  const operations: Array<Prisma.PrismaPromise<unknown>> = [
    prisma.citizenSeasonEvaluation.deleteMany({
      where: {
        seasonId,
        userId,
      },
    }),
  ]

  const citizenSeasonFilters: Prisma.CitizenSeasonWhereInput[] = [{ userId }]

  if (allVariants.length) {
    citizenSeasonFilters.push({
      governanceAddress: {
        in: allVariants,
      },
    })
  }

  operations.push(
    prisma.citizenSeason.deleteMany({
      where: {
        seasonId,
        OR: citizenSeasonFilters,
      },
    }),
  )

  if (normalized.length) {
    operations.push(
      prisma.citizenQualifyingUser.deleteMany({
        where: {
          seasonId,
          address: {
            in: normalized,
          },
        },
      }),
    )

    operations.push(
      prisma.priorityAttestationSnapshot.deleteMany({
        where: {
          seasonId,
          address: {
            in: normalized,
          },
        },
      }),
    )
  }

  await prisma.$transaction(operations)
  await revalidatePath("/citizenship")
}

async function addQualifyingUserEntry(formData: FormData) {
  "use server"

  const userId = String(formData.get("userId") ?? "")
  const seasonId = String(formData.get("seasonId") ?? "")

  if (!userId || !seasonId) {
    throw new Error("Missing parameters for qualifying user action")
  }

  await ensureCurrentUser(userId)

  const user = await fetchUserForTesting(userId)
  const firstAddress = user.addresses[0]?.address

  if (!firstAddress) {
    return
  }

  const normalized = firstAddress.toLowerCase()

  await prisma.citizenQualifyingUser.upsert({
    where: {
      seasonId_address: {
        seasonId,
        address: normalized,
      },
    },
    update: {},
    create: {
      seasonId,
      address: normalized,
    },
  })

  await revalidatePath("/citizenship")
}

async function addPrioritySnapshotEntry(formData: FormData) {
  "use server"

  const userId = String(formData.get("userId") ?? "")
  const seasonId = String(formData.get("seasonId") ?? "")

  if (!userId || !seasonId) {
    throw new Error("Missing parameters for priority snapshot action")
  }

  await ensureCurrentUser(userId)

  const user = await fetchUserForTesting(userId)
  const firstAddress = user.addresses[0]?.address

  if (!firstAddress) {
    return
  }

  const normalized = firstAddress.toLowerCase()

  await prisma.priorityAttestationSnapshot.upsert({
    where: {
      seasonId_address: {
        seasonId,
        address: normalized,
      },
    },
    update: {
      attestationId: `test-attestation-${randomUUID()}`,
      loadedAt: new Date(),
    },
    create: {
      seasonId,
      address: normalized,
      attestationId: `test-attestation-${randomUUID()}`,
      loadedAt: new Date(),
    },
  })

  await revalidatePath("/citizenship")
}

async function toggleWorldIdVerification(formData: FormData) {
  "use server"

  const userId = String(formData.get("userId") ?? "")

  if (!userId) {
    throw new Error("Missing userId for World ID action")
  }

  await ensureCurrentUser(userId)

  const existing = await prisma.userWorldId.findUnique({
    where: {
      userId,
    },
  })

  if (existing) {
    await prisma.userWorldId.delete({
      where: {
        userId,
      },
    })
  } else {
    await prisma.userWorldId.create({
      data: {
        userId,
        verified: true,
        nullifierHash: randomUUID(),
      },
    })
  }

  await revalidatePath("/citizenship")
}

async function toggleKycRecord(formData: FormData) {
  "use server"

  const userId = String(formData.get("userId") ?? "")

  if (!userId) {
    throw new Error("Missing userId for KYC action")
  }

  await ensureCurrentUser(userId)

  const links = await prisma.userKYCUser.findMany({
    where: {
      userId,
    },
  })

  if (links.length > 0) {
    const kycUserIds = links.map((link) => link.kycUserId)

    await prisma.$transaction([
      prisma.userKYCUser.deleteMany({
        where: {
          userId,
        },
      }),
      prisma.kYCUser.deleteMany({
        where: {
          id: {
            in: kycUserIds,
          },
        },
      }),
    ])

    await revalidatePath("/citizenship")
    return
  }

  const user = await fetchUserForTesting(userId)
  const email =
    user.emails.find((entry) => entry.verified)?.email ??
    user.emails[0]?.email ??
    `test-${userId}@example.com`

  const expiry = new Date()
  expiry.setFullYear(expiry.getFullYear() + 1)

  const kycUser = await prisma.kYCUser.create({
    data: {
      email,
      status: KYCStatus.APPROVED,
      expiry,
      personaStatus: PersonaStatus.approved,
    },
  })

  await prisma.userKYCUser.create({
    data: {
      userId,
      kycUserId: kycUser.id,
    },
  })

  await revalidatePath("/citizenship")
}

async function addBlockedEvaluationRecord(formData: FormData) {
  "use server"

  const userId = String(formData.get("userId") ?? "")
  const seasonId = String(formData.get("seasonId") ?? "")

  if (!userId || !seasonId) {
    throw new Error("Missing parameters for evaluation action")
  }

  await ensureCurrentUser(userId)

  const user = await fetchUserForTesting(userId)
  const wallets = user.addresses.map((entry) => entry.address.toLowerCase())
  const socials = collectUserSocials(user)

  const socialProfiles = socials.map(({ platform, identifier }) => ({
    platform,
    identifier,
  }))

  const passportRaw = wallets.map((address) => ({
    address,
    score: 0,
    band: "NONE",
    status: "blocked",
    error: null,
  }))

  await prisma.$transaction([
    prisma.citizenSeasonEvaluation.deleteMany({
      where: {
        seasonId,
        userId,
      },
    }),
    prisma.citizenSeasonEvaluation.create({
      data: {
        seasonId,
        userId,
        wallets,
        socialProfiles: socialProfiles as Prisma.InputJsonValue,
        openRankRaw: [] as Prisma.InputJsonValue,
        passportRaw: passportRaw as Prisma.InputJsonValue,
        outcome: CitizenRegistrationStatus.BLOCKED,
      },
    }),
  ])

  await revalidatePath("/citizenship")
}

async function addOpenRankSnapshotsRecord(formData: FormData) {
  "use server"

  const userId = String(formData.get("userId") ?? "")
  const seasonId = String(formData.get("seasonId") ?? "")
  const variant = String(formData.get("variant") ?? "")
  const platformRaw = String(formData.get("platform") ?? "")
  const identifierRaw = String(formData.get("identifier") ?? "")

  if (!userId || !seasonId) {
    throw new Error("Missing parameters for OpenRank snapshot action")
  }

  if (!isOpenRankTierKey(variant)) {
    throw new Error("Unsupported OpenRank snapshot variant")
  }

  if (!isSocialPlatform(platformRaw) || !identifierRaw) {
    throw new Error("Missing social identifier for OpenRank snapshot action")
  }

  await ensureCurrentUser(userId)

  const user = await fetchUserForTesting(userId)
  const socials = collectUserSocials(user)
  const normalizedIdentifier = normalizeIdentifier(identifierRaw)

  const target = socials.find(
    (social) =>
      social.platform === platformRaw &&
      normalizeIdentifier(social.identifier) === normalizedIdentifier,
  )

  if (!target) {
    return
  }

  const tierConfig = OPEN_RANK_TIER_OPTIONS[variant]
  const payload = {
    score: tierConfig.score,
    raw: {
      [TEST_OPEN_RANK_MARKER]: userId,
      variant,
      band: tierConfig.band,
      label: tierConfig.label,
    } as Prisma.InputJsonValue,
    loadedAt: new Date(),
  }

  await prisma.openRankSnapshot.upsert({
    where: {
      seasonId_platform_identifier: {
        seasonId,
        platform: platformRaw as SocialTrustPlatform,
        identifier: normalizedIdentifier,
      },
    },
    update: payload,
    create: {
      seasonId,
      platform: platformRaw as SocialTrustPlatform,
      identifier: normalizedIdentifier,
      score: tierConfig.score,
      raw: payload.raw,
      loadedAt: payload.loadedAt,
    },
  })

  await revalidatePath("/citizenship")
}

async function removeOpenRankSnapshotsRecord(formData: FormData) {
  "use server"

  const userId = String(formData.get("userId") ?? "")
  const seasonId = String(formData.get("seasonId") ?? "")
  const platformRaw = formData.get("platform")
  const identifierRaw = formData.get("identifier")

  if (!userId || !seasonId) {
    throw new Error("Missing parameters for removing OpenRank snapshots")
  }

  await ensureCurrentUser(userId)

  if (platformRaw || identifierRaw) {
    if (
      typeof platformRaw !== "string" ||
      typeof identifierRaw !== "string" ||
      !platformRaw ||
      !identifierRaw ||
      !isSocialPlatform(platformRaw)
    ) {
      throw new Error("Invalid parameters for removing OpenRank snapshot")
    }

    const normalizedIdentifier = normalizeIdentifier(identifierRaw)

    await prisma.openRankSnapshot.deleteMany({
      where: {
        seasonId,
        platform: platformRaw,
        identifier: normalizedIdentifier,
        raw: {
          path: [TEST_OPEN_RANK_MARKER],
          equals: userId,
        },
      },
    })
  } else {
    await prisma.openRankSnapshot.deleteMany({
      where: {
        seasonId,
        raw: {
          path: [TEST_OPEN_RANK_MARKER],
          equals: userId,
        },
      },
    })
  }

  await revalidatePath("/citizenship")
}

async function ensureCurrentUser(userId: string) {
  const session = await auth()

  if (!session?.user?.id || session.user.id !== userId) {
    throw new Error("Unauthorized Season 9 test mutation")
  }
}

async function fetchUserForTesting(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: {
        orderBy: {
          primary: "desc",
        },
      },
      emails: true,
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  return user
}

function collectUserSocials(user: {
  farcasterId: string | null
  github: string | null
  twitter: string | null
}) {
  const socials: Array<{ platform: SocialTrustPlatform; identifier: string }> = []

  if (user.farcasterId) {
    socials.push({
      platform: "FARCASTER",
      identifier: user.farcasterId,
    })
  }

  if (user.github) {
    socials.push({
      platform: "GITHUB",
      identifier: user.github,
    })
  }

  if (user.twitter) {
    socials.push({
      platform: "X",
      identifier: user.twitter,
    })
  }

  return socials
}

function extractAddressVariants(addresses: Array<{ address: string }>) {
  const original = addresses.map((entry) => entry.address)
  const lowered = original.map((value) => value.toLowerCase())
  const normalized = Array.from(new Set(lowered))
  const allVariants = Array.from(new Set([...original, ...lowered]))

  return { normalized, allVariants }
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

function calculateOpenRankBand(score: number | null): OpenRankBand {
  if (score === null || Number.isNaN(score)) {
    return "NONE"
  }

  if (score >= OPEN_RANK_BAND_THRESHOLDS.PLATINUM) return "PLATINUM"
  if (score >= OPEN_RANK_BAND_THRESHOLDS.GOLD) return "GOLD"
  if (score >= OPEN_RANK_BAND_THRESHOLDS.SILVER) return "SILVER"
  if (score >= OPEN_RANK_BAND_THRESHOLDS.BRONZE) return "BRONZE"
  return "NONE"
}

function mapBandToTone(band: OpenRankBand): StatusTone {
  switch (band) {
    case "BRONZE":
      return "bronze"
    case "SILVER":
      return "silver"
    case "GOLD":
      return "gold"
    case "PLATINUM":
      return "platinum"
    case "NONE":
    default:
      return "neutral"
  }
}

function formatOpenRankBandLabel(band: OpenRankBand) {
  switch (band) {
    case "BRONZE":
      return "Bronze tier"
    case "SILVER":
      return "Silver tier"
    case "GOLD":
      return "Gold tier"
    case "PLATINUM":
      return "Platinum tier"
    case "NONE":
    default:
      return "No score"
  }
}

function renderSocialIcon(platform: SocialTrustPlatform) {
  const commonClass = "h-4 w-4 text-secondary-foreground"
  switch (platform) {
    case "FARCASTER":
      return <Farcaster className={commonClass} fill="currentColor" />
    case "GITHUB":
      return <Github className={commonClass} fill="currentColor" />
    case "X":
    default:
      return <XOptimism className={commonClass} />
  }
}

function normalizeIdentifier(identifier: string) {
  return identifier.trim().toLowerCase()
}

function isSocialPlatform(value: string): value is SocialTrustPlatform {
  return value === "FARCASTER" || value === "GITHUB" || value === "X"
}

function isOpenRankTierKey(value: string): value is OpenRankTierKey {
  return value in OPEN_RANK_TIER_OPTIONS
}

function statusBadgeClass(tone: StatusTone) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"

  switch (tone) {
    case "success":
      return `${base} border-emerald-500/40 bg-emerald-500/10 text-emerald-600`
    case "warning":
      return `${base} border-amber-500/40 bg-amber-500/10 text-amber-700`
    case "danger":
      return `${base} border-destructive/40 bg-destructive/10 text-destructive`
    case "bronze":
      return `${base} border-amber-700/50 bg-amber-600/10 text-amber-800`
    case "silver":
      return `${base} border-slate-400/50 bg-slate-200/30 text-slate-600`
    case "gold":
      return `${base} border-yellow-500/60 bg-yellow-500/10 text-yellow-700`
    case "platinum":
      return `${base} border-sky-500/60 bg-sky-500/10 text-sky-700`
    case "neutral":
      return `${base} border-border-secondary/50 bg-secondary/20 text-secondary-foreground`
    default:
      return `${base} border-border-secondary/50 bg-secondary/20 text-secondary-foreground`
  }
}

function redirectWithParams(params: URLSearchParams) {
  const queryString = params.toString()
  redirect(queryString ? `/citizenship?${queryString}` : "/citizenship")
}

function determineRegistrationCardState({
  season,
  citizenSeason,
  hasVerifiedEmail,
  hasPriorityAccess,
  priorityWindow,
  registrationStarted,
  registrationEnded,
  registrationOpen,
  limitReached,
  isBlocked,
  isLoggedIn,
}: {
  season: SeasonWithConfig
  citizenSeason: S9CitizenSeason | null
  hasVerifiedEmail: boolean
  hasPriorityAccess: boolean
  priorityWindow: boolean
  registrationStarted: boolean
  registrationEnded: boolean
  registrationOpen: boolean
  limitReached: boolean
  isBlocked: boolean
  isLoggedIn: boolean
}): RegistrationCardState | null {
  if (citizenSeason) {
    return null
  }

  // If user is not logged in, show sign-in state
  if (!isLoggedIn) {
    return {
      type: "sign-in",
    }
  }

  if (!registrationStarted) {
    const openDate = season.registrationStartDate
    return {
      type: "registration-closed",
      message: `Citizen registration for ${season.name} opens on ${formatDateLong(openDate)}.`,
    }
  }

  if (registrationEnded || limitReached) {
    return {
      type: "registration-closed",
      message:
        `Thanks for your interest, but the Citizens&apos; House has reached capacity for ${season.name}.`,
    }
  }

  if (isBlocked) {
    return {
      type: "registration-blocked",
      message: `Your onchain activity disqualifies you from becoming a citizen in ${season.name}.`,
    }
  }

  if (priorityWindow && !hasPriorityAccess) {
    const openDate = season.priorityEndDate ?? season.registrationStartDate
    return {
      type: "priority-required",
      message: `Citizen registration for ${season.name} opens to everyone on ${formatDateLong(openDate)}.`,
    }
  }

  if (!hasVerifiedEmail) {
    return {
      type: "add-email",
    }
  }

  if (registrationOpen) {
    return {
      type: "register",
      ctaId: "s9-registration-button",
    }
  }

  return null
}
