"use server"

import { getCitizenByAddress, getCitizenForUser } from "@/db/citizens"
import { getGithubProximity } from "@/db/githubProxomity"
import {
  getExpiredKYCCountForOrganization,
  getExpiredKYCCountForProject,
  getKYCUsersByProjectId,
} from "@/db/kyc"
import {
  getOrganizationKYCTeams,
  getOrganizationWithClient,
} from "@/db/organizations"
import {
  getAllProjectContractsWithClient,
  getProjectContractsWithClient,
  getProjectWithClient,
  getRandomProjectsWithClient,
  getUserAdminProjectsWithDetailWithClient,
} from "@/db/projects"
import {
  getUserByAddress,
  getUserById,
  getUserByUsername,
  getUserPassports,
  getUserWorldId,
} from "@/db/users"
import { getVoteForCitizen } from "@/db/votes"
import { withImpersonation } from "@/lib/db/sessionContext"
import {
  getKycAudienceForOrganization,
  getOrganizationAudience,
  getProjectAudience,
  toOrganizationDTO,
  toOrganizationKycTeamsDTO,
  toProjectDTO,
  toProjectKycUsersDTO,
  toScopedUserDTO,
} from "@/lib/dto"
import { getProjectMetrics } from "@/lib/oso"

import {
  resolveSessionUserId,
  verifyAdminStatus,
  verifyMembership,
  verifyOrganizationMembership,
} from "./utils"

export async function fetchProject(projectId: string) {
  return withImpersonation(async ({ db, userId }) => {
    const [project, audience] = await Promise.all([
      getProjectWithClient({ id: projectId }, db),
      getProjectAudience(db, projectId, userId),
    ])

    return toProjectDTO(project, audience)
  })
}

export async function fetchProjectContracts(projectId: string) {
  return withImpersonation(({ db }) =>
    getProjectContractsWithClient({ projectId }, db),
  )
}

export async function fetchAllProjectContracts(projectId: string) {
  return withImpersonation(({ db }) =>
    getAllProjectContractsWithClient({ projectId }, db),
  )
}

export async function fetchOrganization(organizationId: string) {
  return withImpersonation(async ({ db, userId }) => {
    const [organization, audience] = await Promise.all([
      getOrganizationWithClient({ id: organizationId }, db),
      getOrganizationAudience(db, organizationId, userId),
    ])

    return toOrganizationDTO(organization, audience)
  })
}

export async function fetchOrganizationKycTeams(organizationId: string) {
  return withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      const audience = await getKycAudienceForOrganization(
        db,
        organizationId,
        userId,
      )
      if (!audience) {
        throw new Error("Unauthorized")
      }

      const teams = await getOrganizationKYCTeams({ organizationId }, db)
      return toOrganizationKycTeamsDTO(teams, audience)
    },
    { requireUser: true },
  )
}

export async function fetchUser(userId: string) {
  return withImpersonation(async ({ db, session, userId: sessionUserId }) => {
    const user = await getUserById(userId, db, session)
    return toScopedUserDTO(user, sessionUserId === userId ? "viewer" : "public")
  })
}

export async function fetchUserByAddress(address: string) {
  return withImpersonation(({ db }) => getUserByAddress(address, db))
}

export async function fetchCitizenForUser(userId: string) {
  return withImpersonation(({ db }) => getCitizenForUser(userId, db))
}

export async function fetchCitizenByAddress(address: string) {
  return withImpersonation(({ db }) => getCitizenByAddress(address, db))
}

export async function fetchProposalCandidates(
  identifiers: Array<string | { id?: string; name?: string }>,
) {
  return withImpersonation(async ({ db }) => {
    const results = await Promise.all(
      identifiers.map(async (identifier, index) => {
        const stringIdentifier =
          typeof identifier === "string"
            ? identifier
            : identifier?.id || identifier?.name || `unknown-${index}`

        if (!stringIdentifier) {
          return null
        }

        try {
          const isOrgCitizen =
            typeof stringIdentifier === "string" &&
            stringIdentifier.toLowerCase().startsWith("0x")

          if (isOrgCitizen) {
            const org = await getOrganizationWithClient(
              { id: stringIdentifier },
              db,
            )

            return {
              id: stringIdentifier,
              name: org?.name || stringIdentifier,
              avatar: org?.avatarUrl,
              link: `${process.env.NEXT_PUBLIC_VERCEL_URL}/${stringIdentifier}`,
            }
          }

          const user = await getUserByUsername(stringIdentifier, db)
          return {
            id: stringIdentifier,
            name: user?.username || stringIdentifier,
            avatar: user?.imageUrl,
            link: `${process.env.NEXT_PUBLIC_VERCEL_URL}/${stringIdentifier}`,
          }
        } catch (error) {
          console.error(
            `Error fetching proposal candidate ${stringIdentifier}:`,
            error,
          )
          return {
            id: stringIdentifier,
            name: stringIdentifier,
            link: `${process.env.NEXT_PUBLIC_VERCEL_URL}/${stringIdentifier}`,
          }
        }
      }),
    )

    return results.filter(Boolean)
  })
}

export async function fetchVoteForCitizen(
  proposalId: string,
  citizenIdOrAddress: number | string,
) {
  return withImpersonation(({ db }) =>
    getVoteForCitizen(proposalId, citizenIdOrAddress, db),
  )
}

export async function fetchGithubProximity(username: string | null) {
  if (!username) {
    return null
  }
  return withImpersonation(({ db }) => getGithubProximity(username, db))
}

export async function fetchRandomProjects() {
  return withImpersonation(({ db }) => getRandomProjectsWithClient(db))
}

export async function fetchProjectMetrics(projectId: string) {
  return withImpersonation(() => getProjectMetrics(projectId))
}

export async function fetchKycProjectUsers(projectId: string) {
  return withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      const isInvalid = await verifyAdminStatus(projectId, userId, db)
      if (isInvalid?.error) {
        throw new Error(isInvalid.error)
      }

      const payload = await getKYCUsersByProjectId({ projectId }, db)
      return toProjectKycUsersDTO(payload, "admin")
    },
    { requireUser: true },
  )
}

export async function fetchUserPassports(userId: string) {
  return withImpersonation(
    ({ db, userId: sessionUserId }) => {
      const resolution = resolveSessionUserId(sessionUserId, userId)
      if (resolution.error || !resolution.userId) {
        throw new Error("Unauthorized")
      }

      return getUserPassports(resolution.userId, db)
    },
    { requireUser: true },
  )
}

export async function fetchExpiredKycCountForProject(projectId: string) {
  return withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      const membership = await verifyMembership(projectId, userId, db)
      if (membership?.error) {
        throw new Error(membership.error)
      }

      return getExpiredKYCCountForProject({ projectId }, db)
    },
    { requireUser: true },
  )
}

export async function fetchExpiredKycCountForOrganization(
  organizationId: string,
) {
  return withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      const membership = await verifyOrganizationMembership(
        organizationId,
        userId,
        db,
      )
      if (membership?.error) {
        throw new Error(membership.error)
      }

      return getExpiredKYCCountForOrganization({ organizationId }, db)
    },
    { requireUser: true },
  )
}

export async function fetchUserWorldId(userId: string) {
  return withImpersonation(
    ({ db, userId: sessionUserId }) => {
      const resolution = resolveSessionUserId(sessionUserId, userId)
      if (resolution.error || !resolution.userId) {
        throw new Error("Unauthorized")
      }

      return getUserWorldId(resolution.userId, db)
    },
    { requireUser: true },
  )
}

export async function fetchUserWorldIdVerified(
  userId: string,
): Promise<{ verified: boolean }> {
  return withImpersonation(async ({ db }) => {
    if (!userId) {
      return { verified: false }
    }
    const record = await getUserWorldId(userId, db)
    return { verified: Boolean(record?.verified) }
  })
}

export async function fetchUserAdminProjects(userId: string, roundId?: string) {
  return withImpersonation(
    async ({ db, userId: sessionUserId }) => {
      const resolution = resolveSessionUserId(sessionUserId, userId)
      if (resolution.error || !resolution.userId) {
        throw new Error("Unauthorized")
      }

      const teams = await getUserAdminProjectsWithDetailWithClient(
        {
          userId: resolution.userId,
          roundId,
        },
        db,
      )

      if (!teams) {
        return null
      }

      return {
        ...teams,
        projects: teams.projects.map((membership) => ({
          ...membership,
          project: toProjectDTO(membership.project, "admin"),
        })),
        organizations: teams.organizations.map((membership) => ({
          ...membership,
          organization: toOrganizationDTO(membership.organization, "admin"),
        })),
      }
    },
    { requireUser: true },
  )
}
