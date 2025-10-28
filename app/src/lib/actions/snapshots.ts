"use server"

import { ProjectContract } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import { addOrganizationSnapshot, getOrganization } from "@/db/organizations"
import {
  addProjectSnapshot,
  addPublishedContracts,
  getConsolidatedProjectTeam,
  getProject,
  getProjectContracts,
  revokePublishedContracts,
  updateAllForProject,
} from "@/db/projects"
import { getUserById } from "@/db/users"

import {
  createContractAttestations,
  createOrganizationMetadataAttestation,
  createProjectMetadataAttestation,
  revokeContractAttestations,
} from "../eas/serverOnly"
import { uploadToPinata } from "../pinata"
import { ProjectWithFullDetails } from "../types"
import {
  formatOrganizationMetadata,
  formatProjectMetadata,
  ProjectMetadata,
} from "../utils/metadata"
import { getUnpublishedContractChanges } from "./projects"
import { verifyMembership } from "./utils"

const PUBLISH_CONTRACT_BATCH_LIMIT = 500

export const createProjectSnapshot = async (projectId: string) => {
  const session = await auth()

  const userId = session?.user?.id
  if (!userId) {
    return {
      error: "Unauthorized",
    }
  }

  const isInvalid = await verifyMembership(projectId, userId)
  if (isInvalid?.error) {
    return isInvalid
  }

  const [project, team, unpublishedContractChanges] = await Promise.all([
    getProject({ id: projectId }),
    getConsolidatedProjectTeam({ projectId }),
    getUnpublishedContractChanges(projectId),
  ])
  if (!project) {
    return {
      error: "Project not found",
    }
  }

  try {
    // Upload metadata to IPFS
    const metadata = formatProjectMetadata(project, team)
    const ipfsHash = await uploadToPinata(project.id, metadata)

    // Create metadata attestation only
    const attestationId = await createProjectMetadataAttestation({
      farcasterId: session?.user?.farcasterId
        ? parseInt(session.user.farcasterId)
        : 0,
      projectId: project.id,
      name: project.name,
      category: project.category ?? "",
      ipfsUrl: `https://storage.retrofunding.optimism.io/ipfs/${ipfsHash}`,
    })

    const snapshot = await addProjectSnapshot({
      projectId: project.id,
      ipfsHash,
      attestationId,
    })

    revalidatePath("/dashboard")
    revalidatePath("/projects", "layout")

    return {
      snapshot,
      pendingContracts: {
        toPublish: unpublishedContractChanges?.toPublish?.length ?? 0,
        toRevoke: unpublishedContractChanges?.toRevoke?.length ?? 0,
      },
      error: null,
    }
  } catch (error) {
    const errorType = error instanceof Error ? error.name : "UnknownError"
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorCode = errorMessage.match(/0x[a-fA-F0-9]+/)?.[0] ?? ""

    const errorDetails = {
      errorOrigination: "createProjectSnapshot",
      errorType,
      errorMessage,
      errorCode,
      error: error,
    }
    console.error("Error creating snapshot", errorDetails)

    return {
      error,
    }
  }
}

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
}) => {
  const session = await auth()

  const userId = session?.user?.id
  if (!userId) {
    return {
      error: "Unauthorized",
    }
  }

  const isInvalid = await verifyMembership(projectId, userId)
  if (isInvalid?.error) {
    return isInvalid
  }

  const normalizedBatchSize = Math.max(
    1,
    Math.min(PUBLISH_CONTRACT_BATCH_LIMIT, batchSize ?? PUBLISH_CONTRACT_BATCH_LIMIT),
  )

  const projectContracts = await getProjectContracts({ projectId })
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

  if (revokeBatch.length > 0) {
    const revokeIds = revokeBatch.map((contract) => contract.id)
    await revokeContractAttestations(revokeIds)
    await revokePublishedContracts(revokeIds)
    revokedThisBatch = revokeBatch.length
  }

  if (publishBatch.length > 0) {
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
      farcasterId: session?.user?.farcasterId
        ? parseInt(session.user.farcasterId)
        : 0,
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

      await addPublishedContracts(records)
      publishedThisBatch = records.length
    }
  }

  const updatedProjectContracts = await getProjectContracts({ projectId })
  const updatedDiff = await getUnpublishedContractChanges(
    projectId,
    updatedProjectContracts,
  )

  return {
    error: null,
    publishedThisBatch,
    revokedThisBatch,
    remainingPublish: updatedDiff?.toPublish?.length ?? 0,
    remainingRevoke: updatedDiff?.toRevoke?.length ?? 0,
    totalVerified: updatedProjectContracts?.contracts.length ?? 0,
    totalPublished: updatedProjectContracts?.publishedContracts.length ?? 0,
  }
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

export const createOrganizationSnapshot = async (organizationId: string) => {
  const session = await auth()

  const userId = session?.user?.id
  if (!userId) {
    return {
      error: "Unauthorized",
    }
  }

  const organization = await getOrganization({ id: organizationId })
  if (!organization) {
    return {
      error: "Organization not found",
    }
  }

  const user = await getUserById(userId)
  if (!user) {
    return {
      error: "User not found",
    }
  }

  try {
    // Upload metadata to IPFS
    const metadata = formatOrganizationMetadata(organization)
    const ipfsHash = await uploadToPinata(organizationId, metadata)

    // Create attestation
    const attestationId = await createOrganizationMetadataAttestation({
      farcasterId: user.farcasterId ? parseInt(user.farcasterId) : 0,
      organizationId: organization.id,
      name: organization.name,
      projectIds: organization.projects.map((p) => p.projectId),
      ipfsUrl: `https://storage.retrofunding.optimism.io/ipfs/${ipfsHash}`,
    })

    const snapshot = await addOrganizationSnapshot({
      organizationId,
      ipfsHash,
      attestationId,
    })

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
}
