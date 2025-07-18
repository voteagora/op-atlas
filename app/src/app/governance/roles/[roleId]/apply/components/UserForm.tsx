import { Role, User } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/common/Button"
import { ArrowRightS, CheckboxLine, Close } from "@/components/icons/remix"
import { Github } from "@/components/icons/socials"
import { GithubDisplay } from "@/components/profile/GithubDisplay"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUser } from "@/hooks/db/useUser"
import { useUserAdminProjects } from "@/hooks/db/useUserAdminProjects"
import { usePrivyLinkGithub } from "@/hooks/privy/usePrivyLinkGithub"
import { useApplyForRole } from "@/hooks/role/useApplyForRole"
import { useAnalytics } from "@/providers/AnalyticsProvider"

const TERMS = [
  "Please verify that you understand you may be removed from this role via the Representative Removal proposal type in the Operating Manual.",
  "Please verify that you understand KYC will be required to receive rewards for this role.",
  "Please verify that you understand you may need to sign an agreement with the Foundation prior to onboarding.",
  "Please verify that you are able to commit the necessary time to this role.",
] as const

type SelectedEntity = {
  name: string
  avatar?: string
  userId?: string
  organizationId?: string
}

// Type for the requirements JSON structure
type RoleRequirements = {
  user?: string[]
  organization?: string[]
}

// Type guard to check if requirements is a valid object with user array
const isValidRequirements = (
  requirements: any,
): requirements is RoleRequirements => {
  return (
    requirements &&
    typeof requirements === "object" &&
    Array.isArray(requirements.user)
  )
}

export const UserForm = ({
  user: initialUser,
  selectedEntity,
  role,
}: {
  user: User
  selectedEntity: SelectedEntity
  role: Role
}) => {
  const isUser = !!selectedEntity.userId

  const { user: loadedUser } = useUser({
    id: initialUser.id,
    enabled: true,
  })

  const user = loadedUser || initialUser

  const { track } = useAnalytics()
  const { linkGithub } = usePrivyLinkGithub(user.id)
  const { applyForRole, isLoading } = useApplyForRole()

  const { data: userProjects } = useUserAdminProjects({ userId: user.id })

  const [checkedRules, setCheckedRules] = useState<Record<number, boolean>>({})
  const [conflictsOfInterest, setConflictsOfInterest] = useState("")
  const [requirementsSatisfied, setRequirementsSatisfied] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<any[]>([])
  const [projectRelevanceText, setProjectRelevanceText] = useState<
    Record<string, string>
  >({})
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null)

  const handleCheckboxChange = (index: number) => {
    setCheckedRules((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const handleProjectSelection = (project: any) => {
    setSelectedProjects((prev) => {
      const isSelected = prev.some((p) => p.project.id === project.project.id)
      if (isSelected) {
        // Remove project relevance text when project is deselected
        setProjectRelevanceText((prevText) => {
          const newText = { ...prevText }
          delete newText[project.project.id]
          return newText
        })
        return prev.filter((p) => p.project.id !== project.project.id)
      } else {
        return [...prev, project]
      }
    })
  }

  const removeProject = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.filter((p) => p.project.id !== projectId),
    )
    // Remove project relevance text when project is removed
    setProjectRelevanceText((prevText) => {
      const newText = { ...prevText }
      delete newText[projectId]
      return newText
    })
  }

  const handleProjectRelevanceChange = (projectId: string, value: string) => {
    setProjectRelevanceText((prev) => ({
      ...prev,
      [projectId]: value,
    }))
  }

  useEffect(() => {
    const allTermsChecked = TERMS.every((_, index) => checkedRules[index])
    const requirements = role.requirements as RoleRequirements

    if (!isUser) {
      setRequirementsSatisfied(allTermsChecked)
      return
    }

    // If organization is selected (!isUser), user requirements are satisfied by default
    const customRequirementsSatisfied =
      isUser && requirements.user
        ? requirements.user.every((requirement: string) => {
          if (requirement === "github") {
            const githubSatisfied = !!user.github
            return githubSatisfied
          }
          return true
        })
        : false

    setRequirementsSatisfied(allTermsChecked && customRequirementsSatisfied)
  }, [checkedRules, role, user, isUser])

  const onSubmit = () => {
    // Prepare projects data with descriptions
    const projectsData = selectedProjects.map((project) => ({
      projectId: project.project.id,
      projectName: project.project.name,
      description: projectRelevanceText[project.project.id] || "",
    }))

    track("Submitted Nomination", {
      role_name: role.title,
      number_projects_added_to_self_nomination: projectsData.length,
      candidate_user_id: user.id,
    })

    applyForRole(role.id, {
      userId: selectedEntity.userId,
      organizationId: selectedEntity.organizationId,
      application: JSON.stringify({
        conflictsOfInterest: conflictsOfInterest,
        projects: projectsData,
      }),
    })
  }

  const renderRequiredModules = () => {
    try {
      const requirements = role.requirements as RoleRequirements

      // Only render requirements if the user is selected
      if (!isUser || !isValidRequirements(requirements) || !requirements.user) {
        return null
      }

      return (
        <div className="flex flex-col gap-6">
          {requirements.user.map((requirement: string, index: number) => {
            if (requirement === "github") {
              return (
                <div key={index} className="flex flex-col gap-6">
                  <div className="text-xl font-semibold">
                    Connect your GitHub account to show your code contributions
                    to the Optimism Collective
                  </div>
                  {user.github ? (
                    <div className="flex flex-col gap-2">
                      <div className="text-sm text-foreground">
                        Your GitHub account
                      </div>
                      <div>
                        <GithubDisplay userId={user.id} />
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => {
                        linkGithub()
                      }}
                    >
                      <Github className="w-4 h-4 mr-1" fill="#FFFFFF" />
                      Connect GitHub
                    </Button>
                  )}
                </div>
              )
            }
            // Add more requirement types here as needed
            return null
          })}
        </div>
      )
    } catch (error) {
      console.error(
        "Failed to parse role requirements in renderRequiredModules:",
        error,
        "role.requirements:",
        role.requirements,
      )
      return null
    }
  }

  return (
    <div className="flex flex-col gap-12 w-full text-foreground">
      {renderRequiredModules()}
      <div className="flex flex-col gap-6">
        <div className="text-xl font-semibold">
          Confirm the following and link to any relevant projects
        </div>
        <div className="text-foreground">
          If you have any conflicts of interest, please explain them here.
        </div>
        <div className="relative">
          <textarea
            className="w-full h-[120px] p-3 pb-8 border border-border rounded-md bg-background text-foreground text-sm resize-none focus:outline-none "
            placeholder="Explain your conflicts of interest (optional)"
            maxLength={280}
            value={conflictsOfInterest}
            onChange={(e) => setConflictsOfInterest(e.target.value)}
          />
          <div className="absolute top-[90px] left-[12px] text-xs text-muted-foreground">
            <span
              className={
                conflictsOfInterest.length >= 280 ? "text-red-500" : ""
              }
            >
              {conflictsOfInterest.length}/280
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {TERMS.map((term, index) => (
            <div key={index} className="flex flex-col gap-6">
              <div className="text-foreground">{term}</div>
              <div className="flex flex-row gap-2">
                <Checkbox
                  className="self-start mt-0.5"
                  id={`rule-${index}`}
                  checked={checkedRules[index] || false}
                  onCheckedChange={() => handleCheckboxChange(index)}
                />
                <label
                  htmlFor={`rule-${index}`}
                  className="text-base text-foreground"
                >
                  I understand
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="text-foreground">
          Which projects demonstrate your expertise in this area?
          <div className="text-muted-foreground">
            Choose from your projects in Atlas. If your project isn&apos;t in
            Atlas, then{" "}
            <Link href="/projects/new" className="underline">
              add your project
            </Link>{" "}
            before continuing here. To join a project or organization that
            already exists in Atlas, please have their admin add you.{" "}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-row justify-between text-foreground">
            <div className="flex flex-col">
              Projects that demonstrate your expertise (optional){" "}
              <p className="text-muted-foreground text-xs">
                Create new projects by visiting your profile’s dashboard
              </p>
            </div>
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger
                ref={dropdownTriggerRef}
                className="focus:outline-none"
              >
                <div className="flex flex-row gap-1 items-center">
                  <CheckboxLine className="w-5 h-5" />
                  <div>Choose</div>
                  <ArrowRightS className="w-5 h-5" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {userProjects?.projects && userProjects.projects.length > 0 ? (
                  userProjects.projects.map((project) => {
                    const isSelected = selectedProjects.some(
                      (p) => p.project.id === project.project.id,
                    )
                    return (
                      <DropdownMenuItem
                        key={project.project.id}
                        onSelect={(e) => e.preventDefault()}
                      >
                        <div className="flex flex-row gap-2 justify-between items-center w-[200px]">
                          <div className="flex flex-row gap-2 items-center">
                            {project.project.thumbnailUrl && (
                              <Image
                                src={project.project.thumbnailUrl}
                                alt={project.project.name}
                                width={24}
                                height={24}
                                className="rounded-md"
                              />
                            )}
                            <div className="text-foreground">
                              {project.project.name}
                            </div>
                          </div>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              handleProjectSelection(project)
                            }
                          />
                        </div>
                      </DropdownMenuItem>
                    )
                  })
                ) : (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No projects found
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* NO PROJECTS SELECTED */}
          {selectedProjects.length === 0 ? (
            <button
              type="button"
              className="text-muted-foreground border border-border rounded-md px-3 py-2 cursor-pointer text-left w-full"
              onClick={() => {
                setIsDropdownOpen(true)
                // Focus the dropdown trigger to ensure proper keyboard navigation
                setTimeout(() => {
                  dropdownTriggerRef.current?.focus()
                }, 0)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setIsDropdownOpen(true)
                  setTimeout(() => {
                    dropdownTriggerRef.current?.focus()
                  }, 0)
                }
              }}
              aria-label="Open project selection dropdown"
            >
              None
            </button>
          ) : null}
        </div>

        {/* PROJECTS SELECTED */}
        {selectedProjects.map((project) => (
          <div
            key={project.project.id}
            className="text-muted-foreground border border-border rounded-md p-5 flex flex-col gap-4"
          >
            <div className="flex flex-row gap-2 justify-between items-center">
              <div className="flex flex-row gap-2 items-center">
                {project.project.thumbnailUrl && (
                  <Image
                    src={project.project.thumbnailUrl}
                    alt={project.project.name}
                    width={24}
                    height={24}
                    className="rounded-md"
                  />
                )}
                <div className="text-foreground">{project.project.name}</div>
              </div>
              <button
                type="button"
                onClick={() => removeProject(project.project.id)}
                className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded"
                aria-label={`Remove ${project.project.name} from selection`}
              >
                <Close className="w-4 h-4" fill="#000" />
              </button>
            </div>

            <div className="relative">
              <textarea
                className="w-full h-[120px] p-3 pb-8 border border-border rounded-md bg-background text-foreground text-sm resize-none focus:outline-none "
                placeholder="How is this project relevant to your application? (optional)"
                maxLength={280}
                value={projectRelevanceText[project.project.id] || ""}
                onChange={(e) =>
                  handleProjectRelevanceChange(
                    project.project.id,
                    e.target.value,
                  )
                }
              />
              <div className="absolute top-[90px] left-[12px] text-xs text-muted-foreground">
                <span
                  className={
                    (projectRelevanceText[project.project.id] || "").length >=
                      280
                      ? "text-red-500"
                      : ""
                  }
                >
                  {(projectRelevanceText[project.project.id] || "").length}/280
                </span>
              </div>
            </div>
          </div>
        ))}

        <Button
          onClick={onSubmit}
          className="button-primary mt-10"
          disabled={!requirementsSatisfied || isLoading}
        >
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  )
}
