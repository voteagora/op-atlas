"use client"

import { ArrowUpRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { isBadgeholder } from "@/lib/badgeholders"
import { noRewardsForRound, unclaimedRewards } from "@/lib/rewards"
import {
  ApplicationWithDetails,
  ProjectWithDetails,
  UserOrganizationsWithDetails,
  UserWithAddresses,
} from "@/lib/types"
import { cn, hasShownNoRewardsDialog, profileProgress } from "@/lib/utils"
import { useAnalytics } from "@/providers/AnalyticsProvider"

import ApplicationInterruptiveDialogue from "../application/ApplicationInterruptiveDialogue"
import ExternalLink from "../ExternalLink"
import CreateOrganizationDialog from "../organizations/CreateOrganizationDialog"
import OrganizationOnboardingDialog from "../organizations/OrganizationOnboardingDialog"
import { CompleteProfileCallout } from "../profile/CompleteProfileCallout"
import AddFirstOrganizationProject from "./AddFirstOrganizationProject"
import AddFirstProject from "./AddFirstProject"
import ApplicationBanner from "./ApplicationBanner"
import {
  ApplicationSubmittedCallout,
  FundingRoundAnnouncementCallout,
  UnclaimedRecipientCallout,
} from "./Callouts"
import NoRewardsDialog from "./dialogs/NoRewardsDialog"
import UnclaimedRewardsDialog from "./dialogs/UnclaimedRewardsDialog"
import JoinProjectDialog from "./JoinProjectDialog"
import MakeFirstOrganization from "./MakeFirstOrganization"
import ProfileDetailCard from "./ProfileDetailCard"
import { ProjectRewardRow } from "./ProjectRewardRow"
import UserOrganizationInfoRow from "./UserOrganizationInfoRow"
import UserProjectCard from "./UserProjectCard"
import { useUserProjects } from "@/hooks/db/useUserProjects"
import { useUserById } from "@/hooks/db/useUserById"
import { useUserApplications } from "@/hooks/db/useUserApplications"
import { useUserAdminProjects } from "@/hooks/db/useUserAdminProjects"
import { useUserOrganizations } from "@/hooks/db/useUserOrganizations"

const SHOW_APPLICATIONS = false
const ROUND_ID = "5"

const Dashboard = ({ className }: { className?: string }) => {
  const {
    data: user = null,
    isLoading: isLoadingUser,
    isSuccess: isUserLoaded,
  } = useUserById()

  const {
    data: projects = [],
    isLoading: isLoadingProjects,
    isSuccess: isProjectsLoaded,
  } = useUserProjects()

  const {
    data: organizations = [],
    isLoading: isLoadingOrganizations,
    isSuccess: isOrganizationsLoaded,
  } = useUserOrganizations()

  // const isOrganizationsLoaded = false
  // const organizations: any[] = []
  // const isLoadingOrganizations = true

  const {
    data: adminProjects = [],
    isLoading: isLoadingAdminProjects,
    isSuccess: isAdminProjectsLoaded,
  } = useUserAdminProjects()

  console.log(isLoadingAdminProjects)

  const {
    data: applications = [],
    isLoading: isLoadingApplications,
    // isSuccess: isUserApplicationsLoaded,
  } = useUserApplications()

  const hasSubmittedToCurrentRound = applications.some(
    (application) => application.roundId === ROUND_ID,
  )
  const cardComponents = process.env.NEXT_PUBLIC_APPLICATIONS_CLOSED
    ? []
    : ([
        hasSubmittedToCurrentRound ? (
          <ApplicationSubmittedCallout key="applicationSubmitted" />
        ) : (
          <FundingRoundAnnouncementCallout key="fundingRound" />
        ),
      ] as React.ReactNode[])
  const [joinProjectDialogOpen, setJoinProjectDialogOpen] = useState(false)
  const [showNoRewardsDialog, setShowNoRewardsDialog] = useState(false)
  const [showUnclaimedRewardsDialog, setShowUnclaimedRewardsDialog] =
    useState(false)

  const [showOnBoarding, setShowOnBoarding] = useState(false)
  const [showApplicationDialogue, setShowApplicationDialogue] = useState(false)
  const [showCreateOrganizationDialog, setShowCreateOrganizationDialog] =
    useState(false)
  const [visibleCardsCount, setVisibleCardsCount] = useState(2)

  const { track } = useAnalytics()

  const profileInitiallyComplete = useRef(
    user ? profileProgress(user) === 100 : 0,
  )

  // console.log(profileInitiallyComplete)

  // const userIsBadgeholder = useMemo(() => {
  //   return isBadgeholder(user)
  // }, [user])

  useEffect(() => {
    // User has submitted at least one application but didn't receive any rewards
    if (false) {
      setShowNoRewardsDialog(true)
      return
    }

    if (adminProjects.find((project) => unclaimedRewards(project).length)) {
      setShowUnclaimedRewardsDialog(true)
      const unclaimedReward = projects
        ?.map((project) => project.rewards)
        .flat()
        .find((reward) => !reward.claim || reward.claim.status !== "claimed")!

      cardComponents.push(
        <UnclaimedRecipientCallout
          key="unclaimedRecipient"
          rewardId={unclaimedReward?.id}
        />,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminProjects, projects])

  useEffect(() => {
    if (user && profileInitiallyComplete.current) {
      toast.success("Profile complete! 🎉", {
        action: {
          label: "View Profile",
          onClick: () => window.open(`/${user.username}`, "_blank"),
        },
      })
      // Set to false after showing toast so it doesn't show again
      profileInitiallyComplete.current = false
    }
  }, [user, profileInitiallyComplete.current])

  // TODO: hide rewards section if all rewards are claimed
  // const showRewardsSection = Boolean(
  //   adminProjects?.find((project) => project.applications.length),
  // )

  const handleShowMore = () => {
    setVisibleCardsCount((prevCount) =>
      Math.min(prevCount + 1, cardComponents.length),
    )
  }
  return (
    <div className={cn("flex flex-col gap-y-6 mt-6", className)}>
      {cardComponents.slice(0, visibleCardsCount)}

      {visibleCardsCount < cardComponents.length && (
        <Button
          variant="ghost"
          className="text-sm font-medium text-secondary-foreground !p-0 justify-center"
          onClick={handleShowMore}
        >
          Show 1 more
          <Image
            src="/assets/icons/arrowDownIcon.svg"
            height={4.54}
            width={7.42}
            alt="arrow"
            className="ml-2"
          />
        </Button>
      )}

      {showNoRewardsDialog && (
        <NoRewardsDialog open onOpenChange={setShowNoRewardsDialog} />
      )}

      {showUnclaimedRewardsDialog && (
        <UnclaimedRewardsDialog
          open
          onOpenChange={setShowUnclaimedRewardsDialog}
          projects={projects && projects}
        />
      )}
      {showApplicationDialogue && (
        <ApplicationInterruptiveDialogue
          open
          onOpenChange={setShowApplicationDialogue}
        />
      )}

      {showOnBoarding && (
        <OrganizationOnboardingDialog
          open
          onOpenChange={setShowOnBoarding}
          onConfirm={() => {
            setShowCreateOrganizationDialog(true)
            setShowOnBoarding(false)
          }}
        />
      )}
      {showCreateOrganizationDialog && (
        <CreateOrganizationDialog
          open
          onOpenChange={setShowCreateOrganizationDialog}
        />
      )}
      <div className="card flex flex-col w-full gap-y-12">
        {joinProjectDialogOpen && (
          <JoinProjectDialog
            open
            onOpenChange={(open) => setJoinProjectDialogOpen(open)}
          />
        )}
        {isLoadingUser ? (
          <div className="h-64 bg-gray-300 rounded animate-pulse mb-4" />
        ) : (
          <>
            {user && <ProfileDetailCard user={user} />}
            <div className="flex flex-col gap-4">
              {!profileInitiallyComplete.current && user && (
                <CompleteProfileCallout user={user} />
              )}

              {isOrganizationsLoaded && !organizations.length && (
                <MakeFirstOrganization
                  onClick={() => setShowOnBoarding(true)}
                />
              )}

              {isProjectsLoaded &&
                isOrganizationsLoaded &&
                !projects.length &&
                !organizations.length && (
                  <Link href="/projects/new">
                    <AddFirstProject />
                  </Link>
                )}
            </div>
          </>
        )}

        {isLoadingProjects ? (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3>Your projects</h3>
              <Button
                className="flex items-center gap-2"
                variant="secondary"
                onClick={() => (window.location.href = "/projects/new")}
              >
                <Image
                  src="/assets/icons/plus.svg"
                  width={9}
                  height={9}
                  alt="Plus"
                />
                Add project
              </Button>
            </div>
            <div className="h-40 bg-gray-300 rounded animate-pulse mb-4" />
          </div>
        ) : (
          projects.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3>Your projects</h3>
                <Button
                  className="flex items-center gap-2"
                  variant="secondary"
                  onClick={() => (window.location.href = "/projects/new")}
                >
                  <Image
                    src="/assets/icons/plus.svg"
                    width={9}
                    height={9}
                    alt="Plus"
                  />
                  Add project
                </Button>
              </div>

              {projects?.map((project) => (
                <UserProjectCard key={project.id} project={project} />
              ))}
            </div>
          )
        )}

        {isLoadingOrganizations ? (
          <>
            <p className="text-2xl">Organizations</p>
            <div className="h-40 bg-gray-100 rounded animate-pulse mb-4" />
          </>
        ) : (
          organizations.length > 0 && (
            <>
              <p className="text-2xl">Organizations</p>
              {organizations?.map((organization) => {
                return (
                  <div key={organization.id} className="flex flex-col gap-4">
                    {user && (
                      <UserOrganizationInfoRow
                        user={user}
                        organization={organization}
                      />
                    )}

                    {organization.organization.projects?.length > 0 ? (
                      <>
                        {organization.organization.projects?.map((project) => (
                          <UserProjectCard
                            key={project.id}
                            project={project.project as ProjectWithDetails}
                          />
                        ))}
                      </>
                    ) : (
                      <Link
                        href={`/projects/new?orgId=${organization.organizationId}`}
                      >
                        <AddFirstOrganizationProject />
                      </Link>
                    )}
                  </div>
                )
              })}
            </>
          )
        )}

        {isLoadingAdminProjects ? (
          <div className="flex flex-col gap-4">
            <h3>Your Retro Funding rewards</h3>
            <div className="h-40 bg-gray-300 rounded animate-pulse mb-4" />
          </div>
        ) : (
          adminProjects.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3>Your Retro Funding rewards</h3>
              {adminProjects.map((project) => (
                <ProjectRewardRow key={project.id} project={project} />
              ))}
            </div>
          )
        )}

        {SHOW_APPLICATIONS && (
          <div className="flex flex-col gap-y-6">
            <h3>Your Retro Funding applications</h3>
            {isLoadingApplications ? (
              <div className="h-40 bg-gray-300 rounded animate-pulse mb-4" />
            ) : (
              <>
                <ApplicationBanner
                  application={applications[0]}
                  canApply={false}
                />

                <ExternalLink
                  href="https://gov.optimism.io/t/retro-funding-4-onchain-builders-round-details/7988"
                  className="flex items-center gap-x-2 no-underline text-secondary-foreground"
                >
                  <p className="text-sm font-medium">
                    Learn more about Retro Funding Round 4
                  </p>
                  <ArrowUpRight size={16} />
                </ExternalLink>
              </>
            )}
          </div>
        )}

        {true && (
          <Button
            variant="ghost"
            onClick={() => setJoinProjectDialogOpen(true)}
            className="flex items-center justify-center gap-x-2 no-underline text-secondary-foreground"
          >
            <p className="text-sm font-medium">
              To join an existing project or organization, please have their
              admin add you.
            </p>
            <Image
              src="/assets/icons/arrow-left.svg"
              className="h-3"
              height={12}
              width={12}
              alt="left"
            />
          </Button>
        )}
      </div>
    </div>
  )
}

export default Dashboard
