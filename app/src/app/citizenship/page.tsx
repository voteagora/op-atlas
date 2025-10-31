"use server"

import Link from "next/link"
import { redirect } from "next/navigation"
import { citizenCategory } from "@prisma/client"
import { Link as LinkIcon } from "lucide-react"

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

type S9CitizenSeason = NonNullable<Awaited<ReturnType<typeof getCitizenSeasonByUser>>>

export default async function Page({
  searchParams,
}: {
  searchParams: { redirectUrl?: string }
}) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/")
  }

  const season = await getActiveSeason()

  if (season?.id === "9") {
    return await renderSeasonNinePage({
      userId,
      season,
    })
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
}: {
  userId: string
  season: SeasonWithConfig
}) {
  const user = await getUserById(userId)

  if (!user) {
    redirect("/")
  }

  const citizenSeason = await getCitizenSeasonByUser({
    seasonId: season.id,
    userId,
  })

  const userWallets = user.addresses
    .map((address) => address.address)
    .filter((addr): addr is string => Boolean(addr))
  const normalizedUserWallets = userWallets.map((addr) => addr.toLowerCase())
  const hasVerifiedEmail = user.emails.some((email) => email.verified)
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
    priorityWindow
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
    findBlockedCitizenSeasonEvaluation({
      seasonId: season.id,
      userId,
    }),
  ])

  const limitReached = season.userCitizenLimit
    ? registeredCitizensCount >= season.userCitizenLimit
    : false
  const isBlocked = Boolean(blockedEvaluation)
  const registrationOpen = registrationStarted && !registrationEnded && !limitReached
  const isOpenStatus = registrationStarted && !registrationEnded

  let registeredCardContext: RegisteredCardContext | null = null

  if (citizenSeason) {
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
            </div>
          </div>
          <div className="w-full lg:w-[304px] flex-shrink-0">
            {registeredCardContext ? (
              <RegisteredCard seasonName={season.name} context={registeredCardContext} />
            ) : sidebarCardState ? (
              <RegistrationCard state={sidebarCardState} userId={user.id} season={season} />
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
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
}): RegistrationCardState | null {
  if (citizenSeason) {
    return null
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
