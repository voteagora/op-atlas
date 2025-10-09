"use client"

import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { memo, useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { deleteUserProject } from "@/lib/actions/projects"
import { REWARD_CLAIM_STATUS } from "@/lib/constants"
import { useIsAdmin } from "@/lib/hooks"
import {
  ProjectContracts,
  ProjectTeam,
  ProjectWithFullDetails,
} from "@/lib/types"
import { cn, getProjectStatus, ProjectSection } from "@/lib/utils"
import { RecurringRewardsByRound } from "@/lib/utils/rewards"

import ExternalLink from "../ExternalLink"
import { Separator } from "../ui/separator"
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog"
import { resolveProjectStatus } from "@/lib/utils/kyc"
import { useKYCProject } from "@/hooks/db/useKYCProject"
import { project } from "ramda"
import { Project } from "@prisma/client"

// Helper function to count unclaimed rewards
const getUnclaimedRewardsCount = (project: ProjectWithFullDetails | null) => {
  if (!project) return 0
  return project.rewards.filter(
    (reward) =>
      !reward.claim ||
      (reward.claim.status !== REWARD_CLAIM_STATUS.CLAIMED &&
        reward.claim.status !== REWARD_CLAIM_STATUS.EXPIRED &&
        reward.claim.status !== REWARD_CLAIM_STATUS.REJECTED),
  ).length
}

export const ProjectStatusSidebar = memo(function ProjectStatusSidebar({
  project,
  team,
  contracts,
  recurringRewards,
}: {
  project: ProjectWithFullDetails | null
  team: ProjectTeam
  contracts: ProjectContracts | null
  recurringRewards?: RecurringRewardsByRound[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const isAdmin = useIsAdmin(team)

  const unclaimedCount = getUnclaimedRewardsCount(project)
  const [deletingProject, setDeletingProject] = useState(false)

  const { progressPercent, completedSections } = useMemo(() => {
    return project
      ? getProjectStatus(project, contracts)
      : { progressPercent: 0, completedSections: [] }
  }, [project, contracts])

  const [dashboardLoading, setDashboardLoading] = useState(false)

  const handleGoBack = () => {
    setDashboardLoading(true)
    router.push("/dashboard")
  }

  const deleteProject = async () => {
    if (!project) return

    const result = await deleteUserProject(project.id)
    if (result.error) {
      toast.error("There was an error deleting this project.")
    }

    setDeletingProject(false)
    router.push("/")
  }

  const currentPage = pathname.split("/").slice(-1)[0]
  const hasNotBeenPublished = project ? project?.snapshots.length === 0 : true

  return (
    <div className="sm:flex flex-col gap-4 items-start hidden md:w-full md:max-w-[228px]">
      <Button
        isLoading={dashboardLoading}
        onClick={handleGoBack}
        variant="ghost"
        className="text-sm font-normal !p-0 ml-2"
      >
        {project?.organization?.organization?.name ?? "Your projects"}
        <Image
          src="/assets/icons/arrow-left.svg"
          height={8}
          width={6}
          alt="arrow"
          className="ml-2"
        />
      </Button>

      <h2 className="max-w-48 line-clamp-2 text-2xl font-normal text-secondary-foreground pl-2">
        {project?.name ?? "New project"}
      </h2>

      {hasNotBeenPublished && (
        <div className="flex flex-col gap-2 pl-2">
          <Progress value={progressPercent} className="w-[220px] h-2" />
          <p className="text-sm font-normal">{progressPercent}% complete</p>
        </div>
      )}

      <div className="w-full gap-2">
        {Object.values(ProjectSection).map((option, index) => (
          <div
            key={index}
            className="text-sm text-secondary-foreground flex-row gap-2 px-2 py-1.5 rounded-md hover:bg-tertiary w-full"
          >
            {project ? (
              <Link
                href={`/projects/${project.id}/${option.toLowerCase()}`}
                className={cn(
                  "flex items-center justify-start gap-2",
                  currentPage === option.toLowerCase()
                    ? "font-normal text-foreground"
                    : "",
                )}
              >
                <div className="w-4 flex justify-center">
                  {completedSections.includes(option) ? (
                    <Image
                      src="/assets/icons/tickIcon.svg"
                      width={16}
                      height={16}
                      alt="Check"
                    />
                  ) : (
                    <Image
                      src="/assets/icons/circle-fill.svg"
                      width={6.67}
                      height={6.67}
                      alt="Dot"
                    />
                  )}
                </div>
                {option === "Repos"
                  ? "Repos & Links"
                  : option === "Grants"
                  ? "Pricing & Grants"
                  : option}
              </Link>
            ) : (
              <div className="flex justify-start items-center gap-2">
                <div className="w-4 flex justify-center">
                  <Image
                    src="/assets/icons/circle-fill.svg"
                    width={6.67}
                    height={6.67}
                    alt="Dot"
                  />
                </div>

                <p className="text-sm">{option}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="w-full flex flex-col gap-2 px-2">
        <Separator />
        {project && (
          <>
            <div className="w-full px-2 py-1.5 text-sm text-secondary-foreground flex items-center gap-2 hover:bg-tertiary hover:rounded-md hover:text-muted-foreground">
              <Link
                className={cn([
                  {
                    "font-normal text-foreground": currentPage === "rewards",
                  },
                ])}
                href={`/projects/${project.id}/rewards`}
              >
                Rewards
              </Link>
              {(unclaimedCount > 0 ||
                (recurringRewards && recurringRewards.length > 0)) && (
                <div className="text-xs font-normal text-red-600 bg-red-200 rounded-md px-2 py-0.5">
                  {unclaimedCount + (recurringRewards?.length ?? 0)}
                </div>
              )}
            </div>
            <div className="w-full px-2 py-1.5 text-sm text-secondary-foreground flex items-center gap-2 hover:bg-tertiary hover:rounded-md hover:text-muted-foreground">
              <Link
                className={cn([
                  {
                    "font-normal text-foreground overflow-hidden text-ellipsis whitespace-nowrap":
                      currentPage === "grant-address",
                  },
                ])}
                href={`/projects/${project.id}/grant-address`}
              >
                Grant Delivery Address
              </Link>
              {/* Only shows if Project status resolves to 'PENDING' */}
              <IncompleteCard project={project} />
            </div>
            <Separator />
          </>
        )}
      </div>
      <div className="flex flex-col w-full ml-2">
        <ExternalLink
          className="text-sm text-secondary-foreground font-normal px-2 py-1.5 w-full rounded-md hover:bg-tertiary flex space-x-1 items-center"
          href={`/project/${project?.id}`}
        >
          <span>View project</span>
          <ChevronRight size={16} />
        </ExternalLink>
        <ExternalLink
          className="text-sm text-secondary-foreground font-normal px-2 py-1.5 w-full rounded-md hover:bg-tertiary flex space-x-1 items-center"
          href="https://discord.com/invite/optimism"
        >
          <span>Get help</span>
          <ChevronRight size={16} />
        </ExternalLink>
        {project && isAdmin && (
          <Button
            type="button"
            variant="ghost"
            className=" justify-start px-2 py-1.5 font-normal text-sm text-secondary-foreground w-full rounded-md hover:opacity-100 hover:bg-tertiary"
            style={{ height: "unset" }}
            onClick={() => setDeletingProject(true)}
          >
            Delete project
          </Button>
        )}
      </div>

      {deletingProject && (
        <ConfirmationDialog
          open={deletingProject}
          onOpenChange={(open) => setDeletingProject(open)}
          onConfirm={deleteProject}
          title="Are you sure you want to delete this project?"
          description="This action cannot be undone."
          confirmText="Yes, delete this project"
          cancelText="Cancel"
          variant="destructive"
        />
      )}
    </div>
  )
})

const IncompleteCard = ({ project }: { project: Project | null }) => {
  const { data: kycUsers } = useKYCProject({ projectId: project?.id || "" })
  if (!project || !project.id || !kycUsers) return null
  const projectStatus = resolveProjectStatus(kycUsers)

  if (projectStatus == "APPROVED") return null
  return (
    <div className="flex items-center justify-center bg-red-200 w-[80px] h-5 rotate-[0deg] opacity-100 rounded-full py-[2px] px-2">
      <p className="text-red-600 font-riforma font-normal text-[12px] leading-[16px] tracking-[0%] text-center">
        Incomplete
      </p>
    </div>
  )
}

export { IncompleteCard }
