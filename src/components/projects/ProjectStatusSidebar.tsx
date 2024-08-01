"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { memo, useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { deleteUserProject } from "@/lib/actions/projects"
import { useIsAdmin } from "@/lib/hooks"
import { unclaimedRewards } from "@/lib/rewards"
import { ProjectWithDetails } from "@/lib/types"
import { getProjectStatus, ProjectSection } from "@/lib/utils"

import ExternalLink from "../ExternalLink"
import { DeleteProjectDialog } from "./DeleteProjectDialog"

export const ProjectStatusSidebar = memo(function ProjectStatusSidebar({
  project,
}: {
  project?: ProjectWithDetails
}) {
  const router = useRouter()
  const pathname = usePathname()
  const isAdmin = useIsAdmin(project)

  const [deletingProject, setDeletingProject] = useState(false)

  const { progressPercent, completedSections } = useMemo(() => {
    return project
      ? getProjectStatus(project)
      : { progressPercent: 0, completedSections: [] }
  }, [project])

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

  return (
    <div className="sm:flex flex-col gap-6 items-start hidden">
      <Button
        isLoading={dashboardLoading}
        onClick={handleGoBack}
        variant="ghost"
        className="text-sm font-medium !p-0"
      >
        Your projects{" "}
        <Image
          src="/assets/icons/arrow-left.svg"
          height={8}
          width={6}
          alt="arrow"
          className="ml-2"
        />
      </Button>

      <h2 className="max-w-48 text-ellipsis text-2xl font-semibold text-secondary-foreground text-nowrap overflow-hidden">
        {project?.name ?? "New project"}
      </h2>
      <div className="flex flex-col gap-2">
        <Progress value={progressPercent} className="w-[228px] h-2" />
        <p className="text-sm font-normal">{progressPercent}% complete</p>
      </div>

      <div className="gap-2">
        {Object.values(ProjectSection).map((option, index) => (
          <div
            key={index}
            className="flex justify-start items-center flex-row gap-2 py-2"
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

            {project ? (
              <Link
                href={`/projects/${project.id}/${option.toLowerCase()}`}
                className={
                  currentPage === option.toLowerCase() ? "font-medium" : ""
                }
              >
                {option}
              </Link>
            ) : (
              <p>{option}</p>
            )}
          </div>
        ))}
      </div>

      {project && (
        <div className="border-t border-b border-border w-full py-4 text-sm font-medium flex items-center gap-2">
          <Link href={`/projects/${project.id}/rewards`}>Rewards</Link>
          {unclaimedRewards(project) && (
            <div className="h-[6.7px] w-[6.7px] rounded-full bg-destructive" />
          )}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <ExternalLink
          className="text-sm text-muted-foreground font-normal decoration-muted-foreground"
          href="https://gov.optimism.io/t/retro-funding-4-onchain-builders-round-details/7988"
        >
          Get help
        </ExternalLink>
        {project && isAdmin && (
          <Button
            type="button"
            variant="link"
            className="p-0 text-sm text-muted-foreground font-normal decoration-muted-foreground"
            style={{ height: "unset" }}
            onClick={() => setDeletingProject(true)}
          >
            Delete project
          </Button>
        )}
      </div>

      {deletingProject && (
        <DeleteProjectDialog
          open
          onConfirm={deleteProject}
          onOpenChange={(open) => !open && setDeletingProject(false)}
        />
      )}
    </div>
  )
})
