"use server"

import {
  PrismaClient,
  ProjectContract,
  ProjectSnapshot,
  PublishedContract,
} from "@prisma/client"
import { revalidatePath } from "next/cache"

import {
  addOrganizationSnapshot,
  getOrganizationWithClient,
} from "@/db/organizations"
import {
  addProjectSnapshot,
  addPublishedContracts,
  getConsolidatedProjectTeamWithClient,
  getProjectContractsFresh,
  getProjectWithClient,
  revokePublishedContracts,
  updateAllForProject,
} from "@/db/projects"
import { getUserById } from "@/db/users"
import { SessionContext, withImpersonation } from "@/lib/db/sessionContext"

import {
  createContractAttestations,
  createOrganizationMetadataAttestation,
  createProjectMetadataAttestation,
} from "../eas/serverOnly"
import { uploadToPinata } from "../pinata"
import { ProjectTeam, ProjectWithFullDetails } from "../types"
import {
  formatOrganizationMetadata,
  formatProjectMetadata,
  ProjectMetadata,
} from "../utils/metadata"
import { projectHasUnpublishedChanges } from "../utils"
import { getUnpublishedContractChanges } from "./projects"
import { verifyMembership } from "./utils"

const NO_BATCHING_CONTRACT_THRESHOLD = 150
const PUBLISH_CONTRACT_BATCH_LIMIT = 40

type ProjectMemberContext = SessionContext & { userId: string }

async function withProjectMember<T>(
  projectId: string,
  handler: (ctx: ProjectMemberContext) => Promise<T>,
) {
  return withImpersonation(async (ctx) => {
    if (!ctx.userId) {
      return {
        error: "Unauthorized",
      } as T
    }

    const membership = await verifyMembership(projectId, ctx.userId, ctx.db)
    if (membership?.error) {
      return membership as T
    }

    return handler({ ...ctx, userId: ctx.userId })
  }, { requireUser: true })
}

async function publishContractsWithoutBatching(
  {
    projectId,
    toPublish,
    toRevoke,
    farcasterId,
  }: {
    projectId: string
    toPublish: ProjectContract[]
    toRevoke: PublishedContract[]
    farcasterId: string | null
  },
  db: PrismaClient,
) {
  if (toRevoke.length > 0) {
    // Note: On-chain revocation is disabled because EAS only allows the original
    // attester to revoke attestations, and the signer address has changed over time.
    // We still mark them as revoked in our database for bookkeeping.
    const revokeIds = toRevoke.map((contract) => contract.id)
    await revokePublishedContracts(revokeIds, db)
  }

  if (toPublish.length > 0) {
    const attestationIds = await createContractAttestations({
      contracts: toPublish.map((contract) => ({
        contractAddress: contract.contractAddress,
        chainId: contract.chainId,
        deployer: contract.deployerAddress,
        deploymentTx: contract.deploymentHash,
        signature: contract.verificationProof,
        verificationChainId:
          contract.verificationChainId || contract.chainId,
      })),
      projectId,
      farcasterId:
        farcasterId !== null ? Number.parseInt(farcasterId, 10) || 0 : 0,
      refUID: projectId,
    })

    if (attestationIds.length > 0) {
      const records = attestationIds
        .map((attestationId, index) => {
          const contract = toPublish[index]
          if (!contract) return null
          return {
            id: attestationId,
            contract: contract.contractAddress,
            deploymentTx: contract.deploymentHash,
            deployer: contract.deployerAddress,
            verificationChainId:
              contract.verificationChainId || contract.chainId,
            signature: contract.verificationProof,
            chainId: contract.chainId,
            projectId,
          }
        })
        .filter(Boolean) as {
        id: string
        contract: string
        deploymentTx: string
        deployer: string
        verificationChainId: number
        signature: string
        chainId: number
        projectId: string
      }[]

      if (records.length > 0) {
        await addPublishedContracts(records, db)
      }
    }
  }

  const updatedProjectContracts = await getProjectContractsFresh(
    { projectId },
    db,
  )
  const updatedDiff = await getUnpublishedContractChanges(
    projectId,
    updatedProjectContracts,
  )

  return {
    toPublish: updatedDiff?.toPublish?.length ?? 0,
    toRevoke: updatedDiff?.toRevoke?.length ?? 0,
  }
}

async function createMetadataSnapshotRecord(
  {
    project,
    team,
    farcasterId,
  }: {
    project: ProjectWithFullDetails
    team: ProjectTeam
    farcasterId: string | null
  },
  db: PrismaClient,
) {
  const metadata = formatProjectMetadata(project, team)
  const ipfsHash = await uploadToPinata(project.id, metadata)
  const attestationId = await createProjectMetadataAttestation({
    farcasterId: farcasterId ? parseInt(farcasterId, 10) : 0,
    projectId: project.id,
    name: project.name,
    category: project.category ?? "",
    ipfsUrl: `https://storage.retrofunding.optimism.io/ipfs/${ipfsHash}`,
    refUID: project.id,
  })

  const snapshot = await addProjectSnapshot(
    {
      projectId: project.id,
      ipfsHash,
      attestationId,
    },
    db,
  )

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")

  return { snapshot }
}
export const createProjectSnapshot = async (projectId: string) =>
  withProjectMember(projectId, async ({ db, session, userId }) => {
    const [project, team, unpublishedContractChanges, actingUser] =
      await Promise.all([
        getProjectWithClient({ id: projectId }, db),
        getConsolidatedProjectTeamWithClient({ projectId }, db),
        getUnpublishedContractChanges(projectId),
        getUserById(userId, db, session),
      ])
    if (!project || !team) {
      return {
        error: "Project not found",
      }
    }

    const snapshots = (project.snapshots ?? []) as ProjectSnapshot[]
    const latestSnapshot = getLatestSnapshot(snapshots)
    const hasUnpublishedMetadataChanges = projectHasUnpublishedChanges(
      snapshots,
      project.lastMetadataUpdate,
    )
    const contractsToPublish = unpublishedContractChanges?.toPublish ?? []
    const contractsToRevoke = unpublishedContractChanges?.toRevoke ?? []

    const shouldCreateSnapshot =
      hasUnpublishedMetadataChanges ||
      contractsToPublish.length > 0 ||
      contractsToRevoke.length > 0

    if (!shouldCreateSnapshot && latestSnapshot) {
      return {
        snapshot: latestSnapshot,
        pendingContracts: {
          toPublish: 0,
          toRevoke: 0,
        },
        metadataPending: false,
        requiresBatching: false,
        error: null,
      }
    }

    const farcasterId = actingUser?.farcasterId ?? null
    const shouldPublishWithoutBatching =
      contractsToPublish.length <= NO_BATCHING_CONTRACT_THRESHOLD

    try {
      if (shouldPublishWithoutBatching) {
        const updatedPending = await publishContractsWithoutBatching(
          {
            projectId: project.id,
            toPublish: contractsToPublish,
            toRevoke: contractsToRevoke,
            farcasterId,
          },
          db,
        )

        const { snapshot } = await createMetadataSnapshotRecord(
          {
            project,
            team,
            farcasterId,
          },
          db,
        )

        return {
          snapshot,
          pendingContracts: {
            toPublish: updatedPending.toPublish,
            toRevoke: updatedPending.toRevoke,
          },
          metadataPending: false,
          requiresBatching: false,
          error: null,
        }
      }

      return {
        snapshot: null,
        pendingContracts: {
          toPublish: contractsToPublish.length,
          toRevoke: contractsToRevoke.length,
        },
        metadataPending: true,
        requiresBatching: true,
        error: null,
      }
    } catch (error) {
      const errorType = error instanceof Error ? error.name : "UnknownError"
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorCode = errorMessage.match(/0x[a-fA-F0-9]+/)?.[0] ?? ""

      console.error("Error creating snapshot", {
        errorOrigination: "createProjectSnapshot",
        errorType,
        errorMessage,
        errorCode,
        error,
      })

      return {
        error: errorMessage || "Failed to create snapshot",
      }
    }
  })

const sortContractsForPublishing = (contracts: ProjectContract[]) => {
  return contracts
    .slice()
    .sort((a, b) => {
      const aCreated = new Date(a.createdAt).getTime()
      const bCreated = new Date(b.createdAt).getTime()

      if (aCreated !== bCreated) {
        return aCreated - bCreated
      }

      if (a.chainId !== b.chainId) {
        return a.chainId - b.chainId
      }
      return a.contractAddress.localeCompare(b.contractAddress)
    })
}

export const publishProjectContractsBatch = async ({
  projectId,
  batchSize = PUBLISH_CONTRACT_BATCH_LIMIT,
}: {
  projectId: string
  batchSize?: number
}) =>
  withProjectMember(projectId, async ({ db, session, userId }) => {
    const normalizedBatchSize = Math.max(
      1,
      Math.min(
        PUBLISH_CONTRACT_BATCH_LIMIT,
        batchSize ?? PUBLISH_CONTRACT_BATCH_LIMIT,
      ),
    )

    const [projectContracts, actingUser] = await Promise.all([
      getProjectContractsFresh({ projectId }, db),
      getUserById(userId, db, session),
    ])

    if (!projectContracts) {
      return {
        error: "Project not found",
      }
    }

    const unpublishedContractChanges = await getUnpublishedContractChanges(
      projectId,
      projectContracts,
    )

    const toPublish = sortContractsForPublishing(
      unpublishedContractChanges?.toPublish ?? [],
    )
    const toRevoke = (unpublishedContractChanges?.toRevoke ?? []).slice()

    const publishBatch = toPublish.slice(0, normalizedBatchSize)
    const revokeBatch = toRevoke.slice(0, normalizedBatchSize)

    let publishedThisBatch = 0
    let revokedThisBatch = 0
    let errorMessage: string | null = null
    const contractRefUID = projectContracts.id

    if (revokeBatch.length > 0) {
      // Note: On-chain revocation is disabled because EAS only allows the original
      // attester to revoke attestations, and the signer address has changed over time.
      // We still mark them as revoked in our database for bookkeeping.
      const revokeIds = revokeBatch.map((contract) => contract.id)
      await revokePublishedContracts(revokeIds, db)
      revokedThisBatch = revokeBatch.length
    }

    if (publishBatch.length > 0) {
      const farcasterNumeric = actingUser?.farcasterId
        ? parseInt(actingUser.farcasterId, 10) || 0
        : 0
      const attestationIds = await createContractAttestations({
        contracts: publishBatch.map((contract) => ({
          contractAddress: contract.contractAddress,
          chainId: contract.chainId,
          deployer: contract.deployerAddress,
          deploymentTx: contract.deploymentHash,
          signature: contract.verificationProof,
          verificationChainId:
            contract.verificationChainId || contract.chainId,
        })),
        projectId: projectContracts.id,
        farcasterId: farcasterNumeric,
        refUID: contractRefUID,
      })

      if (attestationIds.length > 0) {
        const records = attestationIds
          .map((attestationId, index) => {
            const contract = publishBatch[index]
            if (!contract) return null
            return {
              id: attestationId,
              contract: contract.contractAddress,
              deploymentTx: contract.deploymentHash,
              deployer: contract.deployerAddress,
              verificationChainId:
                contract.verificationChainId || contract.chainId,
              signature: contract.verificationProof,
              chainId: contract.chainId,
              projectId,
            }
          })
          .filter(Boolean) as {
          id: string
          contract: string
          deploymentTx: string
          deployer: string
          verificationChainId: number
          signature: string
          chainId: number
          projectId: string
        }[]

        await addPublishedContracts(records, db)
        publishedThisBatch = records.length
      }
    }

    const updatedProjectContracts = await getProjectContractsFresh(
      { projectId },
      db,
    )
    const updatedDiff = await getUnpublishedContractChanges(
      projectId,
      updatedProjectContracts,
    )

    return {
      error: errorMessage,
      publishedThisBatch,
      revokedThisBatch,
      remainingPublish: updatedDiff?.toPublish?.length ?? 0,
      remainingRevoke: updatedDiff?.toRevoke?.length ?? 0,
      totalVerified: updatedProjectContracts?.contracts.length ?? 0,
      totalPublished: updatedProjectContracts?.publishedContracts.length ?? 0,
    }
  })

export const finalizeProjectSnapshot = async (projectId: string) =>
  withProjectMember(projectId, async ({ db, session, userId }) => {
    const [project, team, unpublishedContractChanges, actingUser] =
      await Promise.all([
        getProjectWithClient({ id: projectId }, db),
        getConsolidatedProjectTeamWithClient({ projectId }, db),
        getUnpublishedContractChanges(projectId),
        getUserById(userId, db, session),
      ])

    if (!project) {
      return {
        error: "Project not found",
      }
    }

    const pendingPublish = unpublishedContractChanges?.toPublish?.length ?? 0
    const pendingRevoke = unpublishedContractChanges?.toRevoke?.length ?? 0

    if (pendingPublish > 0 || pendingRevoke > 0) {
      return {
        error: "Contracts are still pending publication",
      }
    }

    const snapshots = (project.snapshots ?? []) as ProjectSnapshot[]
    const latestSnapshot = getLatestSnapshot(snapshots)
    const hasUnpublishedMetadataChanges = projectHasUnpublishedChanges(
      snapshots,
      project.lastMetadataUpdate,
    )

    if (!hasUnpublishedMetadataChanges && latestSnapshot) {
      return {
        snapshot: latestSnapshot,
        error: null,
      }
    }

    try {
      const { snapshot } = await createMetadataSnapshotRecord(
        {
          project,
          team,
          farcasterId: actingUser?.farcasterId ?? null,
        },
        db,
      )

      return {
        snapshot,
        error: null,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error("Error finalizing snapshot", error)
      return {
        error: errorMessage || "Failed to finalize snapshot",
      }
    }
  })

function getLatestSnapshot<T extends { createdAt: string | Date }>(
  snapshots: T[] | null | undefined,
): T | undefined {
  if (!snapshots || snapshots.length === 0) {
    return undefined
  }

  return [...snapshots].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0]
}

export const createProjectSnapshotOnBehalf = async (
  project: ProjectMetadata & {
    contracts: {
      address: string
      deploymentTxHash: string
      deployerAddress: string
      verificationProof: string | null
      chainId: number
    }[]
  },
  projectId: string,
  farcasterId: string,
) => {
  // Update project details in the database
  const updateProjectPromise = updateAllForProject(project, projectId)

  const attestationPromise = (async () => {
    // Upload metadata to IPFS
    const ipfsHash = await uploadToPinata(projectId, project)

    // Create attestation
    const attestationId = await createProjectMetadataAttestation({
      farcasterId: parseInt(farcasterId),
      projectId: projectId,
      name: project.name,
      category: project.category ?? "",
      ipfsUrl: `https://storage.retrofunding.optimism.io/ipfs/${ipfsHash}`,
    })

    return { ipfsHash, attestationId }
  })()

  const [{ ipfsHash, attestationId }, _] = await Promise.all([
    attestationPromise,
    updateProjectPromise,
  ])

  return addProjectSnapshot({
    projectId,
    ipfsHash,
    attestationId,
  })
}

export const createOrganizationSnapshot = async (organizationId: string) =>
  withImpersonation(
    async ({ db, userId, session }) => {
      if (!userId) {
        return {
          error: "Unauthorized",
        }
      }

      const organization = await getOrganizationWithClient(
        { id: organizationId },
        db,
      )
      if (!organization) {
        return {
          error: "Organization not found",
        }
      }

      const user = await getUserById(userId, db, session)
      if (!user) {
        return {
          error: "User not found",
        }
      }

      try {
        const metadata = formatOrganizationMetadata(organization)
        const ipfsHash = await uploadToPinata(organizationId, metadata)

        const attestationId = await createOrganizationMetadataAttestation({
          farcasterId: user.farcasterId ? parseInt(user.farcasterId) : 0,
          organizationId: organization.id,
          name: organization.name,
          projectIds: organization.projects.map((p) => p.projectId),
          ipfsUrl: `https://storage.retrofunding.optimism.io/ipfs/${ipfsHash}`,
        })

        const snapshot = await addOrganizationSnapshot(
          {
            organizationId,
            ipfsHash,
            attestationId,
          },
          db,
        )

        revalidatePath("/dashboard")
        revalidatePath("/organizations", "layout")

        return {
          snapshot,
          error: null,
        }
      } catch (error) {
        console.error("Error creating snapshot", error)
        return {
          error,
        }
      }
    },
    { requireUser: true },
  )
