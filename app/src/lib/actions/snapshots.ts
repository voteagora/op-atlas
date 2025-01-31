"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import { addOrganizationSnapshot, getOrganization } from "@/db/organizations"
import {
  addProjectSnapshot,
  getProject,
  updateAllForProject,
} from "@/db/projects"

import {
  createOrganizationMetadataAttestation,
  createProjectMetadataAttestation,
} from "../eas"
import { uploadToPinata } from "../pinata"
import {
  formatOrganizationMetadata,
  formatProjectMetadata,
  ProjectMetadata,
} from "../utils/metadata"
import { verifyMembership } from "./utils"

export const createProjectSnapshot = async (projectId: string) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const isInvalid = await verifyMembership(projectId, session.user.farcasterId)
  if (isInvalid?.error) {
    return isInvalid
  }

  const project = await getProject({ id: projectId })
  if (!project) {
    return {
      error: "Project not found",
    }
  }

  try {
    // Upload metadata to IPFS
    const metadata = formatProjectMetadata(project)
    const ipfsHash = await uploadToPinata(projectId, metadata)

    // Create attestation
    const attestationId = await createProjectMetadataAttestation({
      farcasterId: parseInt(session.user.farcasterId),
      projectId: project.id,
      name: project.name,
      category: project.category ?? "",
      ipfsUrl: `https://storage.retrofunding.optimism.io/ipfs/${ipfsHash}`,
    })

    const snapshot = await addProjectSnapshot({
      projectId,
      ipfsHash,
      attestationId,
    })

    revalidatePath("/dashboard")
    revalidatePath("/projects", "layout")

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

export const createProjectSnapshotOnBehalf = async (
  project: ProjectMetadata,
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

  if (!session?.user?.id) {
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

  try {
    // Upload metadata to IPFS
    const metadata = formatOrganizationMetadata(organization)
    const ipfsHash = await uploadToPinata(organizationId, metadata)

    // Create attestation
    const attestationId = await createOrganizationMetadataAttestation({
      farcasterId: parseInt(session.user.farcasterId),
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
