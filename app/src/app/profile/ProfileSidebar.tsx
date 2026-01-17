import { redirect } from "next/navigation"

import { getOrganizationsWithClient } from "@/db/organizations"
import { getImpersonationContext } from "@/lib/db/sessionContext"

import { UserProfileSidebar } from "./UserProfileSidebar"

type SidebarProject = {
  id: string
  name: string
}

export async function ProfileSidebar() {
  const { db, userId } = await getImpersonationContext()
  if (!userId) {
    return redirect("/dashboard")
  }

  const [organizations, userProjects, organizationProjects] = await Promise.all([
    getOrganizationsWithClient(userId, db),
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
  ])

  const projectsById = new Map<string, SidebarProject>()

  for (const { project } of userProjects) {
    projectsById.set(project.id, { id: project.id, name: project.name })
  }

  for (const membership of organizationProjects) {
    for (const { project } of membership.organization.projects) {
      projectsById.set(project.id, { id: project.id, name: project.name })
    }
  }

  const projects = Array.from(projectsById.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  return <UserProfileSidebar organizations={organizations} projects={projects} />
}
