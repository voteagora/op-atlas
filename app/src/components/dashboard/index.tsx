"use client"

import { ArrowUpRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
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
  NoRewardsCallout,
  RewardsCallout,
  UnclaimedRecipientCallout,
} from "./Callouts"
import NoRewardsDialog from "./dialogs/NoRewardsDialog"
import RewardsMonthlyDialog from "./dialogs/RewardsMonthlyDialog"
import UnclaimedRewardsDialog from "./dialogs/UnclaimedRewardsDialog"
import JoinProjectDialog from "./JoinProjectDialog"
import MakeFirstOrganization from "./MakeFirstOrganization"
import ProfileDetailCard from "./ProfileDetailCard"
import { ProjectRewardRow } from "./ProjectRewardRow"
import UserOrganizationInfoRow from "./UserOrganizationInfoRow"
import UserProjectCard from "./UserProjectCard"

const SHOW_APPLICATIONS = false
const ROUND_ID = "5"

const Dashboard = ({
  className,
  user,
  projects,
  applications,
  organizations,
  adminProjects,
}: {
  className?: string
  user: UserWithAddresses
  projects: ProjectWithDetails[]
  applications: ApplicationWithDetails[]
  organizations?: UserOrganizationsWithDetails[]
  adminProjects: ProjectWithDetails[]
}) => {
  const completeProfileAccordionDismissed = document.cookie.includes(
    "completeProfileAccordionDismissed",
  )
  const [
    isCompleteProfileAccordionDismissed,
    setIsCompleteProfileAccordionDismissed,
  ] = useState(completeProfileAccordionDismissed)

  const cardComponents: ReactNode[] = []

  const [joinProjectDialogOpen, setJoinProjectDialogOpen] = useState(false)
  const [showNoRewardsDialog, setShowNoRewardsDialog] = useState(false)
  const [showUnclaimedRewardsDialog, setShowUnclaimedRewardsDialog] =
    useState(false)
  const [showRewardsMonthlyDialog, setShowRewardsMonthlyDialog] =
    useState(false)

  const [showOnBoarding, setShowOnBoarding] = useState(false)
  const [showApplicationDialogue, setShowApplicationDialogue] = useState(false)
  const [showCreateOrganizationDialog, setShowCreateOrganizationDialog] =
    useState(false)
  const [visibleCardsCount, setVisibleCardsCount] = useState(2)

  const { track } = useAnalytics()

  const profileInitiallyComplete = useRef(profileProgress(user) === 100)

  useEffect(() => {
    // User has submitted at least one application but didn't receive any rewards
    if (false) {
      setShowNoRewardsDialog(true)
      return
    }

    if (adminProjects.find((project) => unclaimedRewards(project).length)) {
      setShowUnclaimedRewardsDialog(true)
      const unclaimedReward = projects
        .map((project) => project.rewards)
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
    if (profileInitiallyComplete.current) {
      toast.success("Profile complete! 🎉", {
        action: {
          label: "View Profile",
          onClick: () => window.open(`/${user.username}`, "_blank"),
        },
      })
      // Set to false after showing toast so it doesn't show again
      profileInitiallyComplete.current = false
    }
  }, [user])

  // TODO: hide rewards section if all rewards are claimed
  const showRewardsSection = Boolean(
    adminProjects?.find((project) => project.applications.length),
  )

  const handleShowMore = () => {
    setVisibleCardsCount((prevCount) =>
      Math.min(prevCount + 1, cardComponents.length),
    )
  }
  return (
    <div className={cn("flex flex-col gap-y-6 mt-6", className)}>
      {/* <RewardsCallout
        roundName="Onchain Builders"
        rewardPeriodStart={new Date("2025-02-01T21:53:13.300Z")}
        rewardPeriodEnd={new Date("2025-02-15T21:53:13.300Z")}
      />
      <NoRewardsCallout
        roundName="Dev Tooling"
        rewardPeriodStart={new Date("2025-02-01T21:53:13.300Z")}
        rewardPeriodEnd={new Date("2025-02-15T21:53:13.300Z")}
      /> */}
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

      {showRewardsMonthlyDialog && (
        <RewardsMonthlyDialog open onOpenChange={setShowRewardsMonthlyDialog} />
      )}
      {showNoRewardsDialog && (
        <NoRewardsDialog open onOpenChange={setShowNoRewardsDialog} />
      )}

      {showUnclaimedRewardsDialog && (
        <UnclaimedRewardsDialog
          open
          onOpenChange={setShowUnclaimedRewardsDialog}
          projects={projects}
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
        <ProfileDetailCard user={user} />

        {(!projects.length ||
          !!!organizations?.length ||
          !profileInitiallyComplete.current) && (
          <div className="flex flex-col gap-4">
            {!isCompleteProfileAccordionDismissed &&
              !profileInitiallyComplete.current && (
                <CompleteProfileCallout
                  user={user}
                  setIsCompleteProfileAccordionDismissed={
                    setIsCompleteProfileAccordionDismissed
                  }
                />
              )}
            {!organizations?.length && (
              <MakeFirstOrganization onClick={() => setShowOnBoarding(true)} />
            )}

            {!projects.length && !organizations?.length && (
              <Link href="/projects/new">
                <AddFirstProject />
              </Link>
            )}
          </div>
        )}

        {projects.length > 0 && (
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

            {projects.map((project) => (
              <UserProjectCard
                key={project.id}
                project={project}
                handleActiveRoundHelpClick={() => {
                  setShowRewardsMonthlyDialog(true)
                }}
                applications={applications}
              />
            ))}
          </div>
        )}

        {organizations?.map((organization) => {
          return (
            <div key={organization.id} className="flex flex-col gap-4">
              <UserOrganizationInfoRow
                user={user}
                organization={organization}
              />
              {organization.organization.projects?.length > 0 ? (
                <>
                  {organization.organization.projects?.map((project) => (
                    <UserProjectCard
                      key={project.id}
                      project={project.project as unknown as ProjectWithDetails}
                      handleActiveRoundHelpClick={() => {
                        setShowRewardsMonthlyDialog(true)
                      }}
                      applications={applications}
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

        {showRewardsSection && (
          <div className="flex flex-col gap-6">
            <h3>Your Retro Funding rewards</h3>
            {adminProjects.map((project) => (
              <ProjectRewardRow key={project.id} project={project} />
            ))}
          </div>
        )}

        {SHOW_APPLICATIONS && (
          <div className="flex flex-col gap-y-6">
            <h3>Your Retro Funding applications</h3>
            {/* canApply is false now that applications are closed */}
            <ApplicationBanner application={applications[0]} canApply={false} />

            <ExternalLink
              href="https://gov.optimism.io/t/retro-funding-4-onchain-builders-round-details/7988"
              className="flex items-center gap-x-2 no-underline text-secondary-foreground"
            >
              <p className="text-sm font-medium">
                Learn more about Retro Funding Round 4
              </p>
              <ArrowUpRight size={16} />
            </ExternalLink>
          </div>
        )}

        {true && (
          <Button
            variant="ghost"
            onClick={() => setJoinProjectDialogOpen(true)}
            className="flex items-center justify-center gap-x-2 no-underline text-secondary-foreground"
          >
            <p className="text-sm font-medium">
              Join an existing project or organization
            </p>
          </Button>
        )}
      </div>

      <p className="text-sm text-secondary-foreground text-center">
        Need support?
        <ExternalLink
          className="font-bold"
          href="https://discord.com/invite/optimism"
        >
          {" "}
          Get help in Discord.
        </ExternalLink>
      </p>
    </div>
  )
}

export default Dashboard
