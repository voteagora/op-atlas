import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"

import { Button } from "@/components/common/Button"
import { ArrowDownS, ArrowUpS, Information } from "@/components/icons/remix"
import { Link as LinkIcon } from "@/components/icons/remix"
import { Optimism } from "@/components/icons/socials"
import { Avatar, AvatarBadge } from "@/components/ui/avatar"
import { useProject } from "@/hooks/db/useProject"
import { useActiveUserApplications } from "@/hooks/role/useActiveUserApplications"
import { useRole } from "@/hooks/role/useRole"
import { useUsername } from "@/hooks/useUsername"
import { OrganizationWithTeamAndProjects, UserWithAddresses } from "@/lib/types"
import { cn } from "@/lib/utils"
import { formatMMMd, formatMMMdyyyy } from "@/lib/utils/date"

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

  const [conflicts, setConflicts] = useState<string | null>(null)
  const [projects, setProjects] = useState<any[] | null>(null)
  const [personalStatement, setPersonalStatement] = useState<string>("")
  const [externalLinks, setExternalLinks] = useState<{ url: string; description: string }[]>([])
  const { data: activeApplications, isLoading } = useActiveUserApplications({
    userId: user?.id,
    organizationId: organization?.id,
    enabled: !!user?.id || !!organization?.id,
  })
  const router = useRouter()

  const { data: role, isLoading: isLoadingRole } = useRole({
    id: roleId!,
    enabled: !!roleId,
  })

  const isSecurityRole = role?.isSecurityRole

  useEffect(() => {
    if (activeApplications && activeApplications.length > 0) {
      const application = JSON.parse(activeApplications[0].application)
      setConflicts(application.conflictsOfInterest)
      setProjects(application.projects)
      setPersonalStatement(application.personalStatement)
      setExternalLinks(application.externalLinks)
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

  const renderRoleDescription = () => {
    if (expanded) {
      return (
        <div className="flex flex-col gap-4">
          <div className="border-t border-border-secondary"></div>
          <div className="font-normal">About this role</div>
          <div className="text-secondary-foreground">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-6 last:mb-0">{children}</p>
                ),
                h1: ({ children }) => <span>{children}</span>,
                h2: ({ children }) => <span>{children}</span>,
                h3: ({ children }) => <span>{children}</span>,
                h4: ({ children }) => <span>{children}</span>,
                strong: ({ children }) => <span>{children}</span>,
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5">{children}</ul>
                ),
                li: ({ children }) => <li className="mb-2">{children}</li>,
              }}
            >
              {role.description}
            </ReactMarkdown>
          </div>
        </div>
      )
    }
  }

  const renderVoteButton = () => {
    if (!role.voteStartAt || !role.voteEndAt) return null
    const now = new Date()
    const isWithinVotingPeriod =
      now >= new Date(role.voteStartAt) && now <= new Date(role.voteEndAt)
    const isWithInNomiationPeriod =
      now >= new Date(role.startAt || "") && now <= new Date(role.endAt || "")
    if (isSecurityRole && (isWithInNomiationPeriod || isWithinVotingPeriod)) {
      return (
        <Button onClick={() => router.push(`/governance/roles/${roleId}`)}>
          View Proposal
        </Button>
      )
    }

    if (!isWithinVotingPeriod) return null

    return (
      <Button onClick={() => window.open("/governance", "_blank")}>View</Button>
    )
  }

  const renderInterestInRole = () => {
    return (
      <>
        <div className="text-foreground font-normal">
          Why are you interested in this role?
        </div>
        <div className="text-secondary-foreground">
          {personalStatement || "None"}
        </div>
      </>
    )
  }

  const renderConflictsOfInterest = () => {
    return (
      <>
        <div className="text-foreground font-normal">
          If you have any conflicts of interest, please explain them here.
        </div>
        <div className="text-secondary-foreground">{conflicts || "None"}</div>
      </>
    )
  }

  const renderExternalLinks = () => {
    return (
      <>
        <div className="text-foreground font-normal">
          Share any links that demonstrate your expertise:
        </div>
        {externalLinks.length > 0 && externalLinks.map((link) => (
          <>

              <div
                key={link.url}
                className="text-secondary-foreground hover:underline flex flex-row gap-2"
              >
                <LinkIcon />
                <Link href={link.url} target="_blank">
                  {link.url}
                </Link>
              </div>
            <p className="text-secondary-foreground">
              {link.description || "None"}
            </p>
          </>
        ))}
        {externalLinks.length === 0 && <div className="text-secondary-foreground">None</div>}
      </>
    )
  }

  const renderProjects = () => {
    return (
      <>
        <div className="text-foreground font-normal">
          Which of your projects demonstrate your expertise?
        </div>
        {projects && projects.length > 0 ? (
          projects.map((project: any, idx: number) => (
            <ProjectDetails key={idx} projectApplication={project} />
          ))
        ) : (
          <div className="text-secondary-foreground">None</div>
        )}
      </>
    )
  }

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      <h2 className="text-xl font-normal">Governance</h2>

      <div className="flex flex-col gap-6 border border-border-secondary rounded-lg p-6">
        <div className="flex flex-row gap-5">
          <Avatar>
            <Optimism className="w-[48px] h-[48px]" fill="#FF0000" />
            {(user?.imageUrl || organization?.avatarUrl) && (
              <AvatarBadge className="absolute w-[24px] h-[24px] top-[14px] right-0 bg-white rounded-full overflow-hidden">
                <Image
                  src={user?.imageUrl || organization?.avatarUrl!}
                  alt="user"
                  width={24}
                  height={24}
                  className="w-full h-full object-cover rounded-full"
                />
              </AvatarBadge>
            )}
          </Avatar>
          <div>
            <div>Candidate for {role.title}</div>
            <div className="text-secondary-foreground">
              Voting {formatMMMd(new Date(role.voteStartAt!))} -{" "}
              {formatMMMd(new Date(role.voteEndAt!))}
            </div>
          </div>
        </div>
        <div className="border-t border-border-secondary"></div>
        {isSecurityRole && renderInterestInRole()}
        {renderProjects()}
        {isSecurityRole && renderExternalLinks()}
        {renderConflictsOfInterest()}
        {renderRoleDescription()}

        <div className="flex flex-row justify-between items-center">
          <button
            type="button"
            className="flex flex-row gap-2 text-secondary-foreground items-center focus:outline-none"
            onClick={() => setExpanded((prev) => !prev)}
          >
            <Information className="w-4 h-4" fill="#000" />
            <div className="text-sm">About this role</div>
            {expanded ? (
              <ArrowUpS className="w-4 h-4" fill="#000" />
            ) : (
              <ArrowDownS className="w-4 h-4" fill="#000" />
            )}
          </button>
          <div className="flex flex-row gap-2">
            {!isSecurityRole && (
              <Button
                variant="outline"
                onClick={() => role.link && window.open(role.link, "_blank")}
              >
                View discussion
              </Button>
            )}
            {renderVoteButton()}
          </div>
        </div>
      </div>
    </div>
  )
}

const ProjectDetails = ({
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
          <span className="text-secondary-foreground">
            {formatMMMdyyyy(new Date(project.createdAt))} -{" "}
            {project.deletedAt
              ? formatMMMdyyyy(new Date(project.deletedAt))
              : "Present"}
          </span>
        </div>
      </div>
      <div className="text-secondary-foreground">{description}</div>
    </div>
  )
}
