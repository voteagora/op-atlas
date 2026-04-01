"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { deleteKycTeam } from "@/db/kyc"
import { checkWalletAddressExists, getKycTeamByWalletAddress } from "@/db/kyc"
import {
  addTeamMembers,
  createProject,
  createProjectKycTeam,
  createProjectKycTeams,
  CreateProjectParams,
  deleteProject,
  deleteProjectKycTeams,
  detachProjectsFromKycTeam,
  getAllPublishedUserProjectsWithClient,
  getKycTeamForProject,
  getPublicRoundApplicationProjectsWithClient,
  getProjectContractsWithClient,
  getProjectMetadataWithClient,
  getProjectsForKycTeam,
  getProjectTeamWithClient,
  getPublicProjectWithClient,
  getPublishedProjectContractsWithClient,
  getUserAdminProjectsWithDetailWithClient,
  getUserApplicationsWithClient,
  getUserProjectsWithDetailsWithClient,
  removeProjectOrganization,
  removeTeamMember,
  updateMemberRole,
  updateProject,
  updateProjectFunding,
  updateProjectOrganization,
  UpdateProjectParams,
} from "@/db/projects"
import { getUserById } from "@/db/users"
import { SessionContext, withImpersonation } from "@/lib/db/sessionContext"
import { getProjectAudience, toProjectDTO } from "@/lib/dto"
import { extractFailedEasTxContext } from "@/lib/eas/txContext"
import { getMiradorChainNameFromChainId } from "@/lib/mirador/chains"

import { createEntityAttestationWithTx } from "../eas/serverOnly"
import {
  appendServerTraceEvent,
  withMiradorTraceStep,
} from "../mirador/serverTrace"
import { MiradorTraceContext } from "../mirador/types"
import { ProjectContracts, ProjectWithDetails, TeamRole } from "../types"
import { createOrganizationSnapshot } from "./snapshots"
import {
  resolveSessionUserId,
  verifyAdminStatus,
  verifyMembership,
  verifyOrganizationMembership,
} from "./utils"

export const getProjects = async (userId: string) =>
  withImpersonation(
    async ({ db, userId: sessionUserId }) => {
      const resolution = resolveSessionUserId(sessionUserId, userId)
      if (resolution.error || !resolution.userId) {
        return []
      }

      const requesterUserId = resolution.userId

      const teams = await getUserProjectsWithDetailsWithClient(
        { userId: requesterUserId },
        db,
      )

      return Promise.all(
        (teams?.projects ?? []).map(async ({ project }) => {
          const audience = await getProjectAudience(
            db,
            project.id,
            requesterUserId,
          )
          return toProjectDTO(project, audience)
        }),
      )
    },
    { requireUser: true },
  )

export const getAllPublishedProjects = async (userId: string) =>
  withImpersonation(async ({ db }) => {
    const projects = await getAllPublishedUserProjectsWithClient({ userId }, db)
    const publishedProjects = [
      ...(projects?.projects
        .map(({ project }) => project)
        .filter((project) => project.snapshots.length > 0) ?? []),
      ...(projects?.organizations
        .map((o) => o.organization.projects)
        .flat()
        .map(({ project }) => project)
        .filter((project) => project.snapshots.length > 0) ?? []),
    ]

    return publishedProjects.map((project) => toProjectDTO(project, "public"))
  })

export const getAdminProjects = async (userId: string, roundId?: string) =>
  withImpersonation(
    async ({ db, userId: sessionUserId }) => {
      const resolution = resolveSessionUserId(sessionUserId, userId)
      if (resolution.error || !resolution.userId) {
        return []
      }

      const requesterUserId = resolution.userId

      const teams = await getUserAdminProjectsWithDetailWithClient(
        { userId: requesterUserId, roundId },
        db,
      )
      const teamProjects = teams?.projects.map(({ project }) => project) ?? []
      const organizationProjects =
        teams?.organizations
          .map(({ organization }) => organization.projects)
          .flat()
          .map(({ project }) => project) ?? []

      // Filter out duplicates
      const organizationProjectIds = organizationProjects.map(({ id }) => id)
      const filteredTeamProjects = teamProjects.filter(
        ({ id }) => !organizationProjectIds.includes(id),
      )
      // Only allow published (snapshotted) projects in application flows
      const hasSnapshots = (p: ProjectWithDetails) =>
        Array.isArray(p.snapshots) && p.snapshots.length > 0

      const publishedTeamProjects = filteredTeamProjects.filter(hasSnapshots)
      const publishedOrgProjects = organizationProjects.filter(hasSnapshots)

      return [...publishedTeamProjects, ...publishedOrgProjects].map(
        (project) => toProjectDTO(project, "admin"),
      )
    },
    { requireUser: true },
  )

export const getProjectMembershipStatus = async (
  projectId: string,
  userId?: string,
) =>
  withImpersonation(
    async ({ db, userId: sessionUserId }) => {
      const resolution = resolveSessionUserId(sessionUserId, userId)
      if (resolution.error || !resolution.userId) {
        return {
          isMember: false,
          error: "Unauthorized",
        }
      }

      const membership = await verifyMembership(
        projectId,
        resolution.userId,
        db,
      )

      return {
        isMember: !membership?.error,
        error: membership?.error ?? null,
      }
    },
    { requireUser: true },
  )

export const getApplications = async (userId: string) =>
  withImpersonation(
    async ({ db, userId: sessionUserId }) => {
      const resolution = resolveSessionUserId(sessionUserId, userId)
      if (resolution.error || !resolution.userId) {
        return []
      }

      return getUserApplicationsWithClient({ userId: resolution.userId }, db)
    },
    { requireUser: true },
  )

export const getPublicRoundApplicationProjects = async (roundId: number) =>
  withImpersonation(async ({ db }) => {
    return getPublicRoundApplicationProjectsWithClient(
      {
        roundId: roundId.toString(),
      },
      db,
    )
  })

export const getUserApplicationsForRound = async (
  userId: string,
  roundId: number,
) =>
  withImpersonation(
    async ({ db, userId: sessionUserId }) => {
      const resolution = resolveSessionUserId(sessionUserId, userId)
      if (resolution.error || !resolution.userId) {
        return []
      }

      return getUserApplicationsWithClient(
        {
          userId: resolution.userId,
          roundId: roundId.toString(),
        },
        db,
      )
    },
    { requireUser: true },
  )

export const getUnpublishedContractChanges = async (
  projectId: string,
  existingProject?: ProjectContracts | null,
) =>
  withImpersonation(async ({ db }) => {
    const project =
      existingProject ??
      (await getProjectContractsWithClient({ projectId }, db))
    const allRelatedPublishedContracts =
      await getPublishedProjectContractsWithClient(
        {
          projectId,
          contacts:
            project?.contracts.map((c) => ({
              contractAddress: c.contractAddress,
              chainId: c.chainId,
            })) ?? [],
        },
        db,
      )

    return {
      toPublish: project?.contracts.filter(
        (c) =>
          !project?.publishedContracts.some(
            (pc) =>
              pc.contract === c.contractAddress && pc.chainId === c.chainId,
          ),
      ),
      toRevoke: allRelatedPublishedContracts.filter(
        (pc) =>
          !project?.contracts.some(
            (c) => c.contractAddress === pc.contract && c.chainId === c.chainId,
          ) || projectId !== pc.projectId,
      ),
    }
  })

async function setProjectOrganizationInternal(
  ctx: SessionContext,
  projectId: string,
  oldOrganizationId?: string,
  organizationId?: string,
) {
  const { db, userId } = ctx

  if (!userId) {
    return { error: "Unauthorized" }
  }

  if (oldOrganizationId === organizationId) {
    return {
      error: null,
      organizationId,
    }
  }

  const [projectAdmin, oldOrganizationAdmin] = await Promise.all([
    verifyAdminStatus(projectId, userId, db),
    oldOrganizationId
      ? verifyOrganizationMembership(oldOrganizationId, userId, db)
      : Promise.resolve(null),
  ])

  const validationError = projectAdmin?.error
    ? projectAdmin
    : oldOrganizationAdmin?.error
    ? oldOrganizationAdmin
    : null

  if (validationError) {
    return validationError
  }

  if (!organizationId) {
    await removeProjectOrganization({ projectId }, db)

    if (oldOrganizationId) {
      await createOrganizationSnapshot(oldOrganizationId)
    }
  } else {
    const isOrganizationAdmin = await verifyOrganizationMembership(
      organizationId,
      userId,
      db,
    )

    if (isOrganizationAdmin?.error) {
      return isOrganizationAdmin
    }

    await updateProjectOrganization({ projectId, organizationId }, db)

    const snapshotPromises = [createOrganizationSnapshot(organizationId)]
    if (oldOrganizationId) {
      snapshotPromises.push(createOrganizationSnapshot(oldOrganizationId))
    }
    await Promise.all(snapshotPromises)
  }

  return {
    error: null,
    organizationId,
  }
}

export const createNewProject = async (
  details: CreateProjectParams,
  organizationId?: string,
  traceContext?: MiradorTraceContext,
) =>
  withImpersonation(
    async (ctx) => {
      const { db, session, userId } = ctx

      if (!userId) {
        return {
          error: "Unauthorized",
        }
      }

      const user = await getUserById(userId, db, session)
      if (!user) {
        return {
          error: "User not found",
        }
      }

      await appendServerTraceEvent({
        traceContext: withMiradorTraceStep(
          traceContext,
          "project_creation_start",
          "backend",
        ),
        eventName: "project_creation_started",
        details: { userId, projectName: details.name, organizationId },
        tags: ["project", "creation"],
      })

      try {
        const { attestationId, txHash, chainId, txInputData } =
          await createEntityAttestationWithTx({
            farcasterId: user?.farcasterId ? parseInt(user.farcasterId) : 0,
            type: "project",
          })
        const miradorChain = getMiradorChainNameFromChainId(chainId)

        const project = await createProject(
          {
            userId,
            projectId: attestationId,
            project: details,
            organizationId,
          },
          { db, session },
        )

        const organizationResult = await setProjectOrganizationInternal(
          ctx,
          project.id,
          undefined,
          organizationId,
        )

        if (organizationResult.error) {
          return organizationResult
        }

        await appendServerTraceEvent({
          traceContext: withMiradorTraceStep(
            traceContext,
            "project_creation_success",
            "backend",
          ),
          eventName: "project_creation_succeeded",
          details: { userId, projectId: project.id, attestationId },
          tags: ["project", "creation"],
          txHashHints:
            txHash && miradorChain
              ? [
                  {
                    txHash,
                    chain: miradorChain,
                    details: "Project entity attestation transaction",
                  },
                ]
              : undefined,
          txInputData,
        })

        revalidatePath("/dashboard")
        return {
          error: null,
          project,
        }
      } catch (error) {
        const failedTxContext = extractFailedEasTxContext(error)
        const failedMiradorChain = getMiradorChainNameFromChainId(
          failedTxContext.chainId,
        )

        await appendServerTraceEvent({
          traceContext: withMiradorTraceStep(
            traceContext,
            "project_creation_exception",
            "backend",
          ),
          eventName: "project_creation_failed",
          details: {
            userId,
            error: error instanceof Error ? error.message : String(error),
          },
          tags: ["project", "creation", "error"],
          txHashHints:
            failedTxContext.txHash && failedMiradorChain
              ? [
                  {
                    txHash: failedTxContext.txHash,
                    chain: failedMiradorChain,
                    details: "Failed project entity attestation transaction",
                  },
                ]
              : undefined,
          txInputData: failedTxContext.txInputData,
        })

        throw error
      }
    },
    { requireUser: true },
  )

export const createNewProjectOnBehalf = async (
  details: CreateProjectParams,
  userId: string,
  traceContext?: MiradorTraceContext,
) =>
  withImpersonation(async ({ db, session }) => {
    const user = await getUserById(userId, db, session)
    if (!user) {
      return {
        error: "User not found",
      }
    }

    await appendServerTraceEvent({
      traceContext: withMiradorTraceStep(
        traceContext,
        "project_creation_on_behalf_start",
        "backend",
      ),
      eventName: "project_creation_started",
      details: { userId, projectName: details.name, onBehalf: true },
      tags: ["project", "creation", "api"],
    })

    try {
      const { attestationId, txHash, chainId, txInputData } =
        await createEntityAttestationWithTx({
          farcasterId: user?.farcasterId ? parseInt(user.farcasterId) : 0,
          type: "project",
        })
      const project = await createProject(
        {
          userId: user.id,
          projectId: attestationId,
          project: details,
        },
        { db, session },
      )
      const miradorChain = getMiradorChainNameFromChainId(chainId)

      await appendServerTraceEvent({
        traceContext: withMiradorTraceStep(
          traceContext,
          "project_creation_on_behalf_success",
          "backend",
        ),
        eventName: "project_creation_succeeded",
        details: {
          userId,
          projectId: project.id,
          attestationId,
          onBehalf: true,
        },
        tags: ["project", "creation", "api"],
        txHashHints:
          txHash && miradorChain
            ? [
                {
                  txHash,
                  chain: miradorChain,
                  details: "Project entity attestation transaction",
                },
              ]
            : undefined,
        txInputData,
      })

      return project
    } catch (error) {
      const failedTxContext = extractFailedEasTxContext(error)
      const failedMiradorChain = getMiradorChainNameFromChainId(
        failedTxContext.chainId,
      )

      await appendServerTraceEvent({
        traceContext: withMiradorTraceStep(
          traceContext,
          "project_creation_on_behalf_exception",
          "backend",
        ),
        eventName: "project_creation_failed",
        details: {
          userId,
          projectName: details.name,
          onBehalf: true,
          error: error instanceof Error ? error.message : String(error),
        },
        tags: ["project", "creation", "api", "error"],
        txHashHints:
          failedTxContext.txHash && failedMiradorChain
            ? [
                {
                  txHash: failedTxContext.txHash,
                  chain: failedMiradorChain,
                  details: "Failed project entity attestation transaction",
                },
              ]
            : undefined,
        txInputData: failedTxContext.txInputData,
      })

      throw error
    }
  })

export const updateProjectDetails = async (
  projectId: string,
  details: UpdateProjectParams,
) =>
  withImpersonation(
    async ({ db, userId, session }) => {
      if (!userId) {
        return {
          error: "Unauthorized",
        }
      }

      const isInvalid = await verifyMembership(projectId, userId, db)

      if (isInvalid?.error) {
        return isInvalid
      }

      const updated = await updateProject(
        {
          id: projectId,
          project: details,
        },
        { db, session },
      )

      revalidatePath("/dashboard")
      revalidatePath("/projects", "layout")
      return {
        error: null,
        project: updated,
      }
    },
    { requireUser: true },
  )

export const setProjectOrganization = async (
  projectId: string,
  oldOrganizationId?: string,
  organizationId?: string,
) =>
  withImpersonation(
    async (ctx) => {
      const result = await setProjectOrganizationInternal(
        ctx,
        projectId,
        oldOrganizationId,
        organizationId,
      )

      if (!result.error) {
        revalidatePath("/dashboard")
        revalidatePath("/projects", "layout")
      }

      return result
    },
    { requireUser: true },
  )

export const deleteUserProject = async (projectId: string) =>
  withImpersonation(
    async ({ db, userId, session }) => {
      if (!userId) {
        return {
          error: "Unauthorized",
        }
      }

      const isInvalid = await verifyAdminStatus(projectId, userId, db)
      if (isInvalid?.error) {
        return isInvalid
      }

      await deleteProject({ id: projectId }, { db, session })

      revalidatePath("/dashboard")
      revalidatePath("/projects", "layout")
      return {
        error: null,
        projectId,
      }
    },
    { requireUser: true },
  )

export const addMembersToProject = async (
  projectId: string,
  userIds: string[],
) =>
  withImpersonation(
    async ({ db, userId, session }) => {
      if (!userId) {
        return {
          error: "Unauthorized",
        }
      }

      const isInvalid = await verifyAdminStatus(projectId, userId, db)
      if (isInvalid?.error) {
        return isInvalid
      }

      await addTeamMembers({ projectId, userIds }, { db, session })

      revalidatePath("/dashboard")
      revalidatePath("/projects", "layout")
      return { error: null }
    },
    { requireUser: true },
  )

export const removeMemberFromProject = async (
  projectId: string,
  memberId: string,
) =>
  withImpersonation(
    async ({ db, userId, session }) => {
      if (!userId || userId === memberId) {
        return {
          error: "Unauthorized",
        }
      }

      const isInvalid = await verifyAdminStatus(projectId, userId, db)
      if (isInvalid?.error) {
        return isInvalid
      }

      const team = await getProjectTeamWithClient({ id: projectId }, db)
      if (team?.team.length === 1) {
        return {
          error: "Cannot remove the final team member",
        }
      }

      await removeTeamMember({ projectId, userId: memberId }, { db, session })

      revalidatePath("/dashboard")
      revalidatePath("/projects", "layout")
      return { error: null }
    },
    { requireUser: true },
  )

export const getKycTeamAction = async (projectId: string) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      const isInvalid = await verifyMembership(projectId, userId, db)
      if (isInvalid?.error) {
        throw new Error(isInvalid.error)
      }

      const project = await getKycTeamForProject({ projectId }, db)

      return project?.kycTeam ?? undefined
    },
    { requireUser: true },
  )

export const setMemberRole = async (
  projectId: string,
  userId: string,
  role: TeamRole,
) =>
  withImpersonation(
    async ({ db, userId: sessionUserId, session }) => {
      if (!sessionUserId) {
        return {
          error: "Unauthorized",
        }
      }

      const isInvalid = await verifyAdminStatus(projectId, sessionUserId, db)
      if (isInvalid?.error) {
        return isInvalid
      }

      await updateMemberRole(
        {
          projectId,
          userId,
          role,
        },
        { db, session },
      )

      revalidatePath("/dashboard")
      revalidatePath("/projects", "layout")
      return { error: null }
    },
    { requireUser: true },
  )

export const setProjectFunding = async (
  projectId: string,
  funding: Prisma.ProjectFundingCreateManyInput[],
) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return {
          error: "Unauthorized",
        }
      }

      const isInvalid = await verifyMembership(projectId, userId, db)
      if (isInvalid?.error) {
        return isInvalid
      }

      await updateProjectFunding({ projectId, funding }, db)

      revalidatePath("/dashboard")
      revalidatePath("/projects", "layout")
      return { error: null }
    },
    { requireUser: true },
  )

export const createProjectKycTeamAction = async ({
  projectId,
  walletAddress,
}: {
  projectId: string
  walletAddress: string
}) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return {
          error: "Unauthorized",
        }
      }

      const isInvalid = await verifyMembership(projectId, userId, db)
      if (isInvalid?.error) {
        return isInvalid
      }

      return createProjectKycTeam({ projectId, walletAddress }, db)
    },
    { requireUser: true },
  )

export const createProjectKYCTeamsAction = async ({
  projectIds,
  kycTeamId,
}: {
  projectIds: string[]
  kycTeamId: string
}) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      await Promise.all(
        projectIds.map(async (projectId) => {
          const isInvalid = await verifyMembership(projectId, userId, db)
          if (isInvalid?.error) {
            throw new Error(isInvalid.error)
          }
        }),
      )

      return createProjectKycTeams({ projectIds, kycTeamId }, db)
    },
    { requireUser: true },
  )

export const deleteProjectKYCTeamsAction = async ({
  projectIds,
  kycTeamId,
}: {
  projectIds: string[]
  kycTeamId: string
}) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      await Promise.all(
        projectIds.map(async (projectId) => {
          const isInvalid = await verifyMembership(projectId, userId, db)
          if (isInvalid?.error) {
            throw new Error(isInvalid.error)
          }
        }),
      )

      return deleteProjectKycTeams({ projectIds, kycTeamId }, db)
    },
    { requireUser: true },
  )

export const detachProjectsFromKycTeamAction = async ({
  projectIds,
  kycTeamId,
}: {
  projectIds: string[]
  kycTeamId: string
}) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      await Promise.all(
        projectIds.map(async (projectId) => {
          const isInvalid = await verifyMembership(projectId, userId, db)
          if (isInvalid?.error) {
            throw new Error(isInvalid.error)
          }
        }),
      )

      return detachProjectsFromKycTeam({ projectIds, kycTeamId }, db)
    },
    { requireUser: true },
  )

export const getProjectsForKycTeamAction = async (kycTeamId: string) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      return getProjectsForKycTeam({ kycTeamId }, db)
    },
    { requireUser: true },
  )

export const deleteProjectKYCTeamAction = async ({
  projectId,
  kycTeamId,
  hasActiveStream,
}: {
  projectId: string
  kycTeamId: string
  hasActiveStream: boolean
}) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      const isInvalid = await verifyAdminStatus(projectId, userId, db)
      if (isInvalid?.error) {
        throw new Error(isInvalid.error)
      }

      return deleteKycTeam({
        kycTeamId,
        hasActiveStream,
      })
    },
    { requireUser: true },
  )

export const getPublicProjectAction = async ({
  projectId,
}: {
  projectId: string
}) =>
  withImpersonation(async ({ db }) => {
    const rawProject = await getPublicProjectWithClient(projectId, db)
    if (!rawProject) return null

    return rawProject
  })

export const getProjectMetadataAction = async ({
  projectId,
}: {
  projectId: string
}) =>
  withImpersonation(async ({ db }) => {
    return getProjectMetadataWithClient(projectId, db)
  })

export const checkWalletAddressExistsAction = async (walletAddress: string) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return {
          error: "Unauthorized",
        }
      }

      const exists = await checkWalletAddressExists(walletAddress, db)
      return { exists }
    },
    { requireUser: true },
  )

export const getKycTeamByWalletAddressAction = async (walletAddress: string) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return {
          error: "Unauthorized",
        }
      }

      return getKycTeamByWalletAddress(walletAddress, db)
    },
    { requireUser: true },
  )
