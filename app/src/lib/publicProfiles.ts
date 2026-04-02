import "server-only"

import {
  getOrganizationWithDetailsWithClient,
  getOrganizationsWithClient,
} from "@/db/organizations"
import { cache } from "@/lib/cache"
import { getAllPublishedUserProjectsWithClient } from "@/db/projects"
import { getUserByUsername } from "@/db/users"
import {
  OrganizationListItemDTO,
  PublicOrganizationProfileDTO,
  PublicProjectCardDTO,
  UserProfilePublicDTO,
  toOrganizationListItemDTO,
  toPublicOrganizationProfileDTO,
  toPublicProjectCardDTO,
  toUserProfilePublicDTO,
} from "@/lib/dto"

export type PublicUserPageDTO = {
  user: UserProfilePublicDTO
  organizations: OrganizationListItemDTO[]
  projects: PublicProjectCardDTO[]
}

async function getPublicUserPageDataFn(
  username: string,
): Promise<PublicUserPageDTO | null> {
  const user = await getUserByUsername(username)
  if (!user) {
    return null
  }

  const [organizations, projectsPayload] = await Promise.all([
    getOrganizationsWithClient(user.id),
    getAllPublishedUserProjectsWithClient({ userId: user.id }),
  ])

  const directProjects = projectsPayload.projects.map(({ project }) => project)
  const organizationProjects = projectsPayload.organizations.flatMap(
    ({ organization }) => organization.projects.map(({ project }) => project),
  )

  const uniqueProjects = new Map<string, PublicProjectCardDTO>()
  for (const project of [...directProjects, ...organizationProjects]) {
    if (!Array.isArray(project.snapshots) || project.snapshots.length === 0) {
      continue
    }

    const publicProject = toPublicProjectCardDTO(project)
    if (publicProject) {
      uniqueProjects.set(publicProject.id, publicProject)
    }
  }

  return {
    user: toUserProfilePublicDTO(user)!,
    organizations: organizations
      .map((organization) => toOrganizationListItemDTO(organization))
      .filter((organization): organization is OrganizationListItemDTO =>
        Boolean(organization),
      ),
    projects: Array.from(uniqueProjects.values()),
  }
}

async function getPublicOrganizationPageDataFn(
  organizationId: string,
): Promise<PublicOrganizationProfileDTO | null> {
  const organization = await getOrganizationWithDetailsWithClient({
    id: organizationId,
  })

  return toPublicOrganizationProfileDTO(organization)
}

export const getPublicUserPageData = cache(getPublicUserPageDataFn)
export const getPublicOrganizationPageData = cache(
  getPublicOrganizationPageDataFn,
)
