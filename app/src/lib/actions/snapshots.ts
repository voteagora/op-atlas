"use server"

import { ProjectContract, PublishedContract } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import { addOrganizationSnapshot, getOrganization } from "@/db/organizations"
import {
  addProjectSnapshot,
  addPublishedContracts,
  getConsolidatedProjectTeam,
  getProject,
  revokePublishedContracts,
  updateAllForProject,
} from "@/db/projects"
import { getUserById } from "@/db/users"

import {
  createFullProjectSnapshotAttestations,
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

    // Create attestation
    const [{ snapshot }, _] = await Promise.all([
      createProjectMetadataAttestations({
        project,
        ipfsHash,
        farcasterId: session?.user?.farcasterId || "0",
        unpublishedContractChanges,
      }),
      unpublishContracts(
        unpublishedContractChanges?.toRevoke?.map((c) => c.id) ?? [],
      ),
    ])

    revalidatePath("/dashboard")
    revalidatePath("/projects", "layout")

    return {
      snapshot,
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

const createProjectMetadataAttestations = async ({
  project,
  ipfsHash,
  farcasterId,
  unpublishedContractChanges,
}: {
  project: ProjectWithFullDetails
  ipfsHash: string
  farcasterId: string
  unpublishedContractChanges: {
    toPublish?: ProjectContract[]
    toRevoke?: PublishedContract[]
  } | null
}) => {
  const attestationsIds = await createFullProjectSnapshotAttestations({
    project: {
      farcasterId: parseInt(farcasterId),
      projectId: project.id,
      name: project.name,
      category: project.category ?? "",
      ipfsUrl: `https://storage.retrofunding.optimism.io/ipfs/${ipfsHash}`,
    },
    contracts:
      unpublishedContractChanges?.toPublish?.map((c) => ({
        contractAddress: c.contractAddress,
        chainId: c.chainId,
        deployer: c.deployerAddress,
        deploymentTx: c.deploymentHash,
        signature: c.verificationProof,
        verificationChainId: c.verificationChainId || c.chainId,
      })) ?? [],
  })

  if (attestationsIds.length === 0) {
    throw new Error("Failed to create attestations")
  }

  // Update database
  const [snapshot] = await updateProjectMetadataDatabase({
    project,
    ipfsHash,
    attestationsIds,
    projectId: project.id,
    unpublishedContractChanges: {
      toPublish: unpublishedContractChanges?.toPublish ?? [],
      toRevoke: unpublishedContractChanges?.toRevoke ?? [],
    },
  })

  return { snapshot, attestationsIds }
}

const unpublishContracts = async (attestationIds: string[]) => {
  await revokeContractAttestations(attestationIds)

  return await revokePublishedContracts(attestationIds)
}

const updateProjectMetadataDatabase = async ({
  project,
  ipfsHash,
  attestationsIds,
  projectId,
  unpublishedContractChanges,
}: {
  project: { id: string }
  ipfsHash: string
  attestationsIds: string[]
  projectId: string
  unpublishedContractChanges: {
    toPublish?: ProjectContract[]
    toRevoke?: PublishedContract[]
  }
}) => {
  const [snapshot] = await Promise.all([
    addProjectSnapshot({
      projectId: project.id,
      ipfsHash,
      attestationId: attestationsIds[0],
    }),
    addPublishedContracts(
      unpublishedContractChanges?.toPublish?.map((c, i) => ({
        id: attestationsIds[i + 1],
        contract: c.contractAddress,
        deploymentTx: c.deploymentHash,
        deployer: c.deployerAddress,
        verificationChainId: c.verificationChainId || c.chainId,
        signature: c.verificationProof,
        chainId: c.chainId,
        projectId,
      })) ?? [],
    ),
  ])
  return [snapshot]
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
