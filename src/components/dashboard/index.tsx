"use client"

import { Application, Project, User } from "@prisma/client"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { ProjectWithDetails } from "@/lib/types"
import { cn, getProjectStatus } from "@/lib/utils"

import AddFirstProject from "./AddFirstProject"
import ApplicationBanner from "./ApplicationBanner"
import ProfileDetailCard from "./ProfileDetailCard"
import UserProjectCard from "./UserProjectCard"

const Dashboard = ({
  className,
  user,
  projects,
  applications,
}: {
  className?: string
  user: User
  projects: ProjectWithDetails[]
  applications: Application[]
}) => {
  const canApply = useMemo(() => {
    return projects.some(
      (project) => getProjectStatus(project).progressPercent === 100,
    )
  }, [projects])

  return (
    <div className={cn("card flex flex-col w-full gap-y-12", className)}>
      <ProfileDetailCard user={user} />

      <div className="flex flex-col gap-6">
        <h3>Your Projects</h3>
        {projects.length > 0 ? (
          <>
            {projects.map((project) => (
              <UserProjectCard key={project.id} project={project} />
            ))}
          </>
        ) : (
          <Link href="/projects/new">
            <AddFirstProject />
          </Link>
        )}

        <div className="flex items-center gap-x-2">
          <Link href="/projects/new">
            <Button variant="destructive">Add a project</Button>
          </Link>
          <Button variant="secondary">Join a project</Button>
        </div>
      </div>

      <div className="flex flex-col gap-y-6">
        <h3>Your Retro Funding applications</h3>
        <ApplicationBanner application={applications[0]} canApply={canApply} />

        <Link
          href="#"
          className="flex items-center gap-x-2 no-underline text-secondary-foreground"
        >
          <p className="text-sm font-medium">
            Learn more about Retro Funding Round 4
          </p>
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
