"use client"

import { useMemo } from "react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ProjectWithDetails } from "@/lib/types"
import { getProjectStatus, ProjectSection } from "@/lib/utils"

export default function ProjectFormStatusSidebar({
  project,
}: {
  project?: ProjectWithDetails
}) {
  const router = useRouter()
  const pathname = usePathname()

  const { progressPercent, completedSections } = useMemo(() => {
    return project
      ? getProjectStatus(project)
      : { progressPercent: 0, completedSections: [] }
  }, [project])

  const handleGoBack = () => {
    router.push("/dashboard")
  }

  const currentPage = pathname.split("/").slice(-1)[0]

  return (
    <div className="sm:flex flex-col gap-6 items-start hidden">
      <Button
        onClick={handleGoBack}
        variant="outline"
        className="bg-white text-sm font-medium"
      >
        Profile
      </Button>
      <h2
        className={`${
          project?.name ? "text-secondary-foreground" : "text-muted"
        } max-w-48 text-ellipsis text-nowrap overflow-hidden`}
      >
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
                  width={20}
                  height={20}
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
    </div>
  )
}
