import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Button } from "@/components/common/Button"
import { ArrowDownS, ArrowUpS, FileList2 } from "@/components/icons/reminx"
import { Optimism } from "@/components/icons/socials"
import { Avatar, AvatarBadge } from "@/components/ui/avatar"
import { useProject } from "@/hooks/db/useProject"
import { useActiveUserApplications } from "@/hooks/role/useActiveUserApplications"
import { useRole } from "@/hooks/role/useRole"
import { useUsername } from "@/hooks/useUsername"
import { OrganizationWithTeamAndProjects, UserWithAddresses } from "@/lib/types"
import { cn } from "@/lib/utils"
import { formatMMMd, formatMMMdyyyy } from "@/lib/utils/date"
import { stripMarkdown } from "@/lib/utils/markdown"

export default function RoleApplication({
  user,
  organization,
  className,
}: {
  user?: UserWithAddresses
  organization?: OrganizationWithTeamAndProjects
  className?: string
}) {
  const [roleId, setRoleId] = useState<number | null>(null)
  const [expanded, setExpanded] = useState(false)

  const { data: activeApplications, isLoading } = useActiveUserApplications({
    userId: user?.id,
    organizationId: organization?.id,
    enabled: !!user?.id || !!organization?.id,
  })

  const username = useUsername(user)

  const { data: role, isLoading: isLoadingRole } = useRole({
    id: roleId!,
    enabled: !!roleId,
  })

  useEffect(() => {
    if (activeApplications && activeApplications.length > 0) {
      if (organization) {
        // Find application with matching organizationId
        const orgApplication = activeApplications.find(
          (app) => app.organizationId === organization.id,
        )
        if (orgApplication) {
          setRoleId(orgApplication.roleId)
        } else {
          // Fallback to first application if no matching organization found
          setRoleId(activeApplications[0].roleId)
        }
      } else {
        // No organization provided, use first application
        setRoleId(activeApplications[0].roleId)
      }
    }
  }, [activeApplications, organization])

  if (
    isLoading ||
    !activeApplications ||
    activeApplications.length === 0 ||
    isLoadingRole ||
    !role
  )
    return null

  const cleanDescription = stripMarkdown(role.description || "")

  const renderApplication = () => {
    const conflictsOfInterest = JSON.parse(
      activeApplications[0].application,
    ).conflictsOfInterest
    const hasConflictsOfInterest = conflictsOfInterest.length > 0

    const projects = JSON.parse(activeApplications[0].application).projects
    const hasProjects = projects.length > 0

    if (expanded) {
      return (
        <div className="flex flex-col gap-6 mb-6">
          <div className="border-t border-border-secondary my-4"></div>
          <div>{`${username || organization?.name}'s self nomination`}</div>
          <div>
            If you have any conflicts of interest, please explain them here.
          </div>
          <div className="text-muted-foreground">
            {hasConflictsOfInterest ? conflictsOfInterest : "None"}
          </div>
          <div>Which of your projects demonstrate your expertise?</div>

          {hasProjects ? (
            projects.map((project: any, idx: number) => (
              <ProjectDedetails key={idx} projectApplication={project} />
            ))
          ) : (
            <div className="text-muted-foreground">None</div>
          )}
        </div>
      )
    }
  }

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      <h2 className="text-xl font-medium">Elections</h2>

      <div className="flex flex-col gap-6 border border-border-secondary rounded-lg p-6">
        <div className="flex flex-row gap-5">
          <Avatar>
            <Optimism className="w-[48px] h-[48px]" fill="#FF0000" />
            {(user?.imageUrl || organization?.avatarUrl) && (
              <AvatarBadge className="absolute w-[24px] h-[24px] top-[14px] right-0 bg-white rounded-full">
                <Image
                  src={user?.imageUrl || organization?.avatarUrl!}
                  alt="user"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </AvatarBadge>
            )}
          </Avatar>
          <div>
            <div>Candidate for {role.title}</div>
            <div className="text-muted-foreground">
              Season 8 <span className="text-muted">|</span> Voting{" "}
              {formatMMMd(new Date(role.voteStartAt!))} -{" "}
              {formatMMMd(new Date(role.voteEndAt!))}
            </div>
          </div>
        </div>
        <div
          className={`text-muted-foreground ${
            !expanded ? " line-clamp-3" : ""
          }`}
        >
          {cleanDescription}
        </div>
        {renderApplication()}
        <div className="flex flex-row justify-between items-center">
          <button
            type="button"
            className="flex flex-row gap-2 text-secondary-foreground items-center focus:outline-none"
            onClick={() => setExpanded((prev) => !prev)}
          >
            <FileList2 className="w-4 h-4" fill="#000" />
            <div>
              {expanded
                ? `Hide ${username || organization?.name}'s application`
                : `View ${username || organization?.name}'s application`}
            </div>
            {expanded ? (
              <ArrowUpS className="w-4 h-4" fill="#000" />
            ) : (
              <ArrowDownS className="w-4 h-4" fill="#000" />
            )}
          </button>
          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => role.link && window.open(role.link, "_blank")}
            >
              View discussion
            </Button>
            <Button
              onClick={() => role.link && window.open("/governance", "_blank")}
            >
              Vote
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

const ProjectDedetails = ({
  projectApplication,
}: {
  projectApplication: {
    projectId: string
    projectName: string
    description: string
  }
}) => {
  const { projectId, description } = projectApplication

  const { data: project } = useProject({ id: projectId, enabled: true })

  if (!project) return null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row gap-2 items-center">
        {project.thumbnailUrl && (
          <Image
            src={project.thumbnailUrl}
            alt={project.name}
            width={24}
            height={24}
            className="rounded-md"
          />
        )}
        <div>
          <Link
            href={`/project/${projectId}`}
            className="hover:underline text-foreground"
          >
            {project.name}
          </Link>{" "}
          <span className="text-muted-foreground">
            {formatMMMdyyyy(new Date(project.createdAt))} -{" "}
            {project.deletedAt
              ? formatMMMdyyyy(new Date(project.deletedAt))
              : "Present"}
          </span>
        </div>
      </div>
      <div className="text-muted-foreground">{description}</div>
    </div>
  )
}
