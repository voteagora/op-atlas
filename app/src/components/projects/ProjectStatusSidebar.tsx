"use client"

import { Project } from "@prisma/client"
import { ChevronRight, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { memo, useMemo, useState } from "react"
import { toast } from "sonner"

import { CheckboxCircleFIll } from "@/components/icons/remix"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useExpiredKYCCountForProject } from "@/hooks/db/useExpiredKYCCount"
import { useKYCProject } from "@/hooks/db/useKYCProject"
import { deleteUserProject } from "@/lib/actions/projects"
import { REWARD_CLAIM_STATUS } from "@/lib/constants"
import { useIsAdmin } from "@/lib/hooks"
import {
  ProjectContracts,
  ProjectTeam,
  ProjectWithFullDetails,
} from "@/lib/types"
import { cn, getProjectStatus, ProjectSection } from "@/lib/utils"
import { resolveProjectStatus } from "@/lib/utils/kyc"
import { RecurringRewardsByRound } from "@/lib/utils/rewards"

import ExternalLink from "../ExternalLink"

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

const getDisplayName = (option: string) => {
  if (option === "Repos") return "Repos & Links"
  if (option === "Grants") return "Pricing & Grants"
  return option
}

export const ProjectStatusSidebar = memo(function ProjectStatusSidebar({
  project,
  team,
  contracts,
  recurringRewards,
  switcherProjects = [],
  switcherOrganizations = [],
}: {
  project: ProjectWithFullDetails | null
  team: ProjectTeam
  contracts: ProjectContracts | null
  recurringRewards?: RecurringRewardsByRound[]
  switcherProjects?: { id: string; name: string }[]
  switcherOrganizations?: { id: string; name: string }[]
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

  const otherProjects = useMemo(() => {
    if (!project?.id) return switcherProjects
    return switcherProjects.filter((p) => p.id !== project.id)
  }, [project?.id, switcherProjects])

  const hasRewardsBadge =
    unclaimedCount > 0 || (recurringRewards && recurringRewards.length > 0)

  return (
    <div className="sm:flex flex-col gap-y-6 items-start hidden w-full max-w-[228px]">
      <Button
        isLoading={dashboardLoading}
        onClick={handleGoBack}
        variant="ghost"
        className="text-sm font-normal text-secondary-foreground !p-0 justify-start"
      >
        Dashboard
        <Image
          src="/assets/icons/arrow-left.svg"
          height={8}
          width={6}
          alt="arrow"
          className="ml-2"
        />
      </Button>

      <div className="w-full">
        <div className="py-2.5 border-b border-border text-sm font-semibold text-foreground line-clamp-2">
          {project?.name ?? "New Project"}
        </div>

        {hasNotBeenPublished && (
          <div className="flex flex-col gap-1.5 pt-3.5">
            <Progress value={progressPercent} className="w-full h-2" />
            <p className="text-sm font-normal text-secondary-foreground">
              {progressPercent}% complete
            </p>
          </div>
        )}

        <div className="flex flex-col space-y-1.5 py-3.5 text-secondary-foreground text-sm">
          {Object.values(ProjectSection).map((option) => {
            const isActive = currentPage === option.toLowerCase()
            const isCompleted = completedSections.includes(option)

            return project ? (
              <Link
                key={option}
                href={`/projects/${project.id}/${option.toLowerCase()}`}
                className={cn(
                  "flex gap-2 items-center",
                  isActive && "text-foreground font-medium",
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 flex items-center justify-center shrink-0",
                    !isActive && !isCompleted && "invisible",
                  )}
                >
                  {isCompleted ? (
                    <CheckboxCircleFIll className="w-4 h-4" fill="#1DBA6A" />
                  ) : (
                    <span className="text-muted-foreground">•</span>
                  )}
                </div>
                {getDisplayName(option)}
              </Link>
            ) : (
              <div key={option} className="flex gap-2 items-center">
                <div className="w-4 h-4 flex items-center justify-center shrink-0 invisible">
                  <span>•</span>
                </div>
                {getDisplayName(option)}
              </div>
            )
          })}

          {project && (
            <>
              <Link
                href={`/projects/${project.id}/rewards`}
                className={cn(
                  "flex gap-2 items-center",
                  currentPage === "rewards" && "text-foreground font-medium",
                )}
              >
                <span>Rewards</span>
                {hasRewardsBadge && (
                  <div className="text-xs font-normal text-red-600 bg-red-200 rounded-md px-2 py-0.5">
                    {unclaimedCount + (recurringRewards?.length ?? 0)}
                  </div>
                )}
              </Link>

              <Link
                href={`/projects/${project.id}/grant-address`}
                className={cn(
                  "flex gap-2 items-center",
                  currentPage === "grant-address" &&
                    "text-foreground font-medium",
                )}
              >
                <span className="truncate">Grant Address</span>
                <IncompleteCard project={project} />
                <ExpiredBadge project={project} />
              </Link>
            </>
          )}
        </div>

        <div className="flex flex-col space-y-1.5 pt-3.5 text-secondary-foreground text-sm">
          {project && (
            <ExternalLink
              className="flex gap-2 items-center"
              href={`/project/${project.id}`}
            >
              <span>View project</span>
              <ChevronRight size={16} />
            </ExternalLink>
          )}
          <ExternalLink
            className="flex gap-2 items-center"
            href="https://discord.gg/tGyeUqRqgE"
          >
            <span>Get help</span>
            <ChevronRight size={16} />
          </ExternalLink>
          {project && isAdmin && (
            <button
              type="button"
              className="flex gap-2 items-center text-left"
              onClick={() => setDeletingProject(true)}
            >
              Delete project
            </button>
          )}
        </div>
      </div>

      <div className="w-full">
        <div className="py-2.5 border-b border-border text-sm font-semibold text-foreground">
          Your Other Projects
        </div>
        <ul className="flex flex-col space-y-1.5 py-3.5 text-secondary-foreground text-sm">
          {otherProjects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/projects/${p.id}/details`}
                className="flex gap-2 items-center font-medium text-foreground"
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0 text-muted-foreground">
                  <span>•</span>
                </div>
                <span className="truncate">{p.name}</span>
              </Link>
              <Link
                href={`/projects/${p.id}/grant-address`}
                className="flex gap-2 items-center ml-6"
              >
                <span className="truncate">Grant Address</span>
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/projects/new"
              className="flex gap-2 items-center"
            >
              <Plus size={16} />
              Create project
            </Link>
          </li>
        </ul>
      </div>

      <div className="w-full">
        <div className="py-2.5 border-b border-border text-sm font-semibold text-foreground">
          Your Organizations
        </div>
        <ul className="flex flex-col space-y-1.5 py-3.5 text-secondary-foreground text-sm">
          {switcherOrganizations.map((o) => (
            <li key={o.id}>
              <Link
                href={`/profile/organizations/${o.id}`}
                className="flex gap-2 items-center font-medium text-foreground"
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0 text-muted-foreground">
                  <span>•</span>
                </div>
                <span className="truncate">{o.name}</span>
              </Link>
              <Link
                href={`/profile/organizations/${o.id}/grant-address`}
                className="flex gap-2 items-center ml-6"
              >
                <span className="truncate">Grant Addresses</span>
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/profile/organizations/new"
              className="flex gap-2 items-center"
            >
              <Plus size={16} />
              Create organization
            </Link>
          </li>
        </ul>
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
  const { data: kycData } = useKYCProject({ projectId: project?.id || "" })
  if (!project || !project.id || !kycData) return null
  const projectStatus = resolveProjectStatus(
    kycData.users,
    kycData.legalEntities,
  )

  if (projectStatus == "APPROVED") return null
  return (
    <div className="flex items-center justify-center bg-red-200 h-5 rounded-full py-[2px] px-2">
      <p className="text-red-600 font-riforma font-normal text-[12px] leading-[16px] text-center">
        Incomplete
      </p>
    </div>
  )
}

const ExpiredBadge = ({ project }: { project: Project | null }) => {
  const { data: expiredCount } = useExpiredKYCCountForProject({
    projectId: project?.id || "",
    enabled: !!project?.id,
  })

  if (!expiredCount || expiredCount === 0) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <Badge variant="destructive">{expiredCount}</Badge>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {expiredCount} expired verification{expiredCount !== 1 ? "s" : ""}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { ExpiredBadge, IncompleteCard }
