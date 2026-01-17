import {
  getConsolidatedProjectTeamWithClient,
  getProjectContractsWithClient,
  getProjectWithClient,
} from "@/db/projects"
import { getProjectRecurringRewards } from "@/db/rewards"
import { withImpersonation } from "@/lib/db/sessionContext"
import { formatRecurringRewards } from "@/lib/utils/rewards"

import { ProjectStatusSidebar } from "./ProjectStatusSidebar"

type SwitcherItem = {
  id: string
  name: string
}

export async function ProjectSidebar({ projectId }: { projectId: string }) {
  return withImpersonation(async ({ db, userId }) => {
    const switcherDataPromise = userId
      ? Promise.all([
          db.userProjects.findMany({
            where: {
              userId,
              deletedAt: null,
              project: {
                deletedAt: null,
              },
            },
            select: {
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          }),
          db.userOrganization.findMany({
            where: {
              userId,
              deletedAt: null,
              organization: {
                deletedAt: null,
              },
            },
            select: {
              organization: {
                select: {
                  id: true,
                  name: true,
                  projects: {
                    where: {
                      deletedAt: null,
                      project: {
                        deletedAt: null,
                      },
                    },
                    select: {
                      project: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          }),
        ]).then(([userProjects, organizationMemberships]) => {
          const projectsById = new Map<string, SwitcherItem>()

          for (const { project } of userProjects) {
            projectsById.set(project.id, { id: project.id, name: project.name })
          }

          const organizations = organizationMemberships
            .map((membership) => membership.organization)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((organization) => {
              for (const { project } of organization.projects) {
                projectsById.set(project.id, {
                  id: project.id,
                  name: project.name,
                })
              }
              return {
                id: organization.id,
                name: organization.name,
              }
            })

          const projects = Array.from(projectsById.values()).sort((a, b) =>
            a.name.localeCompare(b.name),
          )

          return { projects, organizations }
        })
      : Promise.resolve({ projects: [], organizations: [] })

    const [project, team, contracts, recurringRewards, switcherData] =
      await Promise.all([
        getProjectWithClient({ id: projectId }, db),
        getConsolidatedProjectTeamWithClient({ projectId }, db),
        getProjectContractsWithClient({ projectId }, db),
        getProjectRecurringRewards(projectId, db),
        switcherDataPromise,
      ])

    return (
      <ProjectStatusSidebar
        project={project}
        team={team}
        contracts={contracts}
        recurringRewards={formatRecurringRewards(recurringRewards)}
        switcherProjects={switcherData.projects}
        switcherOrganizations={switcherData.organizations}
      />
    )
  })
}
