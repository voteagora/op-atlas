"use client"

import { Application, Project, User } from "@prisma/client"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { isBadgeholder } from "@/lib/badgeholders"
import { ProjectWithDetails, UserWithAddresses } from "@/lib/types"
import { cn, profileProgress } from "@/lib/utils"
import { useAnalytics } from "@/providers/AnalyticsProvider"

import ExternalLink from "../ExternalLink"
import { CompleteProfileCallout } from "../profile/CompleteProfileCallout"
import AddFirstProject from "./AddFirstProject"
import ApplicationBanner from "./ApplicationBanner"
import { BadgeholderCallout, DeveloperCallout } from "./Callouts"
import JoinProjectDialog from "./JoinProjectDialog"
import ProfileDetailCard from "./ProfileDetailCard"
import UserProjectCard from "./UserProjectCard"

const Dashboard = ({
  className,
  user,
  projects,
  applications,
}: {
  className?: string
  user: UserWithAddresses
  projects: ProjectWithDetails[]
  applications: Application[]
}) => {
  const [joinProjectDialogOpen, setJoinProjectDialogOpen] = useState(false)

  const [loadingNewProject, setLoadingNewProject] = useState(false)

  const { track } = useAnalytics()

  const userIsBadgeholder = useMemo(() => {
    return isBadgeholder(user)
  }, [user])

  const profileInitiallyComplete = useRef(profileProgress(user) === 100)

  return (
    <div className={cn("flex flex-col gap-y-6 mt-6", className)}>
      {userIsBadgeholder ? <BadgeholderCallout /> : <DeveloperCallout />}
      <div className="card flex flex-col w-full gap-y-12">
        {joinProjectDialogOpen && (
          <JoinProjectDialog
            open
            onOpenChange={(open) => setJoinProjectDialogOpen(open)}
          />
        )}
        <ProfileDetailCard user={user} />
        {!profileInitiallyComplete.current && (
          <CompleteProfileCallout user={user} />
        )}
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
            <Link
              href="/projects/new"
              onClick={() => {
                track("Add new project clicked")
                setLoadingNewProject(true)
              }}
            >
              <Button
                isLoading={loadingNewProject}
                variant={projects.length === 0 ? "destructive" : "secondary"}
              >
                Add a project
              </Button>
            </Link>
            <Button
              onClick={() => setJoinProjectDialogOpen(true)}
              variant="secondary"
            >
              Join a project
            </Button>
          </div>
        </div>

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
      </div>
    </div>
  )
}

export default Dashboard
