"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import {
  addProjectSnapshot,
  getProject,
  updateAllForProject,
} from "@/db/projects"

import { createProjectMetadataAttestation } from "../eas"
import { uploadToPinata } from "../pinata"
import { APPLICATIONS_CLOSED } from "../utils"
import { formatProjectMetadata, ProjectMetadata } from "../utils/metadata"
import { publishAndSaveApplication } from "./applications"
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

    // If the project has an application, we need to publish a new one to reference this snapshot.
    if (project.applications.length > 0 && !APPLICATIONS_CLOSED) {
      await publishAndSaveApplication({
        projectId,
        farcasterId: session.user.farcasterId,
        metadataSnapshotId: snapshot.attestationId,
      })
    }

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
