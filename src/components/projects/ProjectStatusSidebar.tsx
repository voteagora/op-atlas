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
import { cn, getProjectStatus, ProjectSection } from "@/lib/utils"

import ExternalLink from "../ExternalLink"
import { Separator } from "../ui/separator"
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
    <div className="sm:flex flex-col gap-4 items-start hidden">
      <Button
        isLoading={dashboardLoading}
        onClick={handleGoBack}
        variant="ghost"
        className="text-sm font-medium !p-0 ml-2"
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

      <h2 className="max-w-48 line-clamp-2 text-2xl font-semibold text-secondary-foreground pl-2">
        {project?.name ?? "New project"}
      </h2>
      <div className="flex flex-col gap-2 pl-2">
        <Progress value={progressPercent} className="w-[228px] h-2" />
        <p className="text-sm font-normal">{progressPercent}% complete</p>
      </div>

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
                    ? "font-medium text-foreground"
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
                className={
                  currentPage === "rewards" ? "font-medium text-foreground" : ""
                }
                href={`/projects/${project.id}/rewards`}
              >
                Rewards
              </Link>
            </div>
            <Separator />
          </>
        )}
      </div>

      <div className="flex flex-col w-full ml-2">
        <ExternalLink
          className="text-sm text-secondary-foreground font-normal px-2 py-1.5 w-full rounded-md hover:bg-tertiary"
          href="https://discord.com/invite/optimism"
        >
          Get help
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
        <DeleteProjectDialog
          open
          onConfirm={deleteProject}
          onOpenChange={(open) => !open && setDeletingProject(false)}
        />
      )}
    </div>
  )
})
