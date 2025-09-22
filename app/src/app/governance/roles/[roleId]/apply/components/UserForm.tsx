import { Role, User } from "@prisma/client"
import { useEffect } from "react"

import { Button } from "@/components/common/Button"
import { Github } from "@/components/icons/socials"
import { GithubDisplay } from "@/components/profile/GithubDisplay"
import { useUser } from "@/hooks/db/useUser"
import { useUserAdminProjects } from "@/hooks/db/useUserAdminProjects"
import { usePrivyLinkGithub } from "@/hooks/privy/usePrivyLinkGithub"
import { useApplyForRole } from "@/hooks/role/useApplyForRole"
import { useAnalytics } from "@/providers/AnalyticsProvider"
import { SecurityCouncilForm } from "./SecurityCouncilForm"
import { StandardRoleForm } from "./StandardRoleForm"

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

  const isSecurityRole = role.isSecurityRole

  const handleFormSubmit = (applicationData: any) => {
    const projectsData = applicationData.projects || []

    track("Submitted Nomination", {
      role_name: role.title,
      number_projects_added_to_self_nomination: projectsData.length,
      candidate_user_id: user.id,
      elementType: "Button",
      elementName: "Submit",
    })

    applyForRole(role.id, {
      userId: selectedEntity.userId,
      organizationId: selectedEntity.organizationId,
      application: JSON.stringify(applicationData),
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

  const getRequirementsSatisfied = () => {
    const requirements = role.requirements as RoleRequirements

    if (!isUser) {
      return true
    }

    // If organization is selected (!isUser), user requirements are satisfied by default
    const customRequirementsSatisfied =
      isUser && requirements.user
        ? requirements.user.every((requirement: string) => {
            if (requirement === "github") {
              return !!user.github
            }
            return true
          })
        : true

    return customRequirementsSatisfied
  }

  const renderFormByRoleType = () => {
    const requirementsSatisfied = getRequirementsSatisfied()

    if (isSecurityRole) {
      return (
        <SecurityCouncilForm
          role={role}
          user={user}
          userProjects={userProjects ?? undefined}
          onSubmit={handleFormSubmit}
          isLoading={isLoading}
          requirementsSatisfied={requirementsSatisfied}
        />
      )
    }

    return (
      <StandardRoleForm
        role={role}
        user={user}
        userProjects={userProjects ?? undefined}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        requirementsSatisfied={requirementsSatisfied}
      />
    )
  }

  return (
    <div className="flex flex-col gap-12 w-full text-foreground">
      {renderRequiredModules()}
      {renderFormByRoleType()}
    </div>
  )
}
