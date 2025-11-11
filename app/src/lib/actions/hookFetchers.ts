"use server"

import {
  getAllProjectContractsWithClient,
  getProjectContractsWithClient,
  getProjectWithClient,
  getRandomProjectsWithClient,
  getUserAdminProjectsWithDetailWithClient,
} from "@/db/projects"
import {
  getOrganizationKYCTeams,
  getOrganizationWithClient,
} from "@/db/organizations"
import {
  getCitizenByAddress,
  getCitizenForUser,
} from "@/db/citizens"
import {
  getKYCUsersByProjectId,
  getExpiredKYCCountForOrganization,
  getExpiredKYCCountForProject,
} from "@/db/kyc"
import { getGithubProximity } from "@/db/githubProxomity"
import {
  getUserByAddress,
  getUserById,
  getUserByUsername,
  getUserPassports,
  getUserWorldId,
} from "@/db/users"
import { getVoteForCitizen } from "@/db/votes"
import { withSessionDb } from "@/lib/db/sessionContext"

export async function fetchProject(projectId: string) {
  return withSessionDb(({ db }) =>
    getProjectWithClient({ id: projectId }, db),
  )
}

export async function fetchProjectContracts(projectId: string) {
  return withSessionDb(({ db }) =>
    getProjectContractsWithClient({ projectId }, db),
  )
}

export async function fetchAllProjectContracts(projectId: string) {
  return withSessionDb(({ db }) =>
    getAllProjectContractsWithClient({ projectId }, db),
  )
}

export async function fetchOrganization(organizationId: string) {
  return withSessionDb(({ db }) =>
    getOrganizationWithClient({ id: organizationId }, db),
  )
}

export async function fetchOrganizationKycTeams(organizationId: string) {
  return withSessionDb(({ db }) =>
    getOrganizationKYCTeams({ organizationId }, db),
  )
}

export async function fetchUser(userId: string) {
  return withSessionDb(({ db, session }) =>
    getUserById(userId, db, session),
  )
}

export async function fetchUserByAddress(address: string) {
  return withSessionDb(({ db }) => getUserByAddress(address, db))
}

export async function fetchCitizenForUser(userId: string) {
  return withSessionDb(({ db }) => getCitizenForUser(userId, db))
}

export async function fetchCitizenByAddress(address: string) {
  return withSessionDb(({ db }) => getCitizenByAddress(address, db))
}

export async function fetchProposalCandidates(
  identifiers: Array<string | { id?: string; name?: string }>,
) {
  return withSessionDb(async ({ db }) => {
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
  citizenId: number,
) {
  return withSessionDb(({ db }) =>
    getVoteForCitizen(proposalId, citizenId, db),
  )
}

export async function fetchGithubProximity(username: string | null) {
  if (!username) {
    return null
  }
  return withSessionDb(({ db }) => getGithubProximity(username, db))
}

export async function fetchRandomProjects() {
  return withSessionDb(({ db }) => getRandomProjectsWithClient(db))
}

export async function fetchKycProjectUsers(projectId: string) {
  return withSessionDb(({ db }) =>
    getKYCUsersByProjectId({ projectId }, db),
  )
}

export async function fetchUserPassports(userId: string) {
  return withSessionDb(({ db }) => getUserPassports(userId, db))
}

export async function fetchExpiredKycCountForProject(projectId: string) {
  return withSessionDb(({ db }) =>
    getExpiredKYCCountForProject({ projectId }, db),
  )
}

export async function fetchExpiredKycCountForOrganization(
  organizationId: string,
) {
  return withSessionDb(({ db }) =>
    getExpiredKYCCountForOrganization({ organizationId }, db),
  )
}

export async function fetchUserWorldId(userId: string) {
  return withSessionDb(({ db }) => getUserWorldId(userId, db))
}

export async function fetchUserAdminProjects(
  userId: string,
  roundId?: string,
) {
  return withSessionDb(({ db }) =>
    getUserAdminProjectsWithDetailWithClient(
      {
        userId,
        roundId,
      },
      db,
    ),
  )
}
