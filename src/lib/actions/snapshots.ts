"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import { addProjectSnapshot, getProject } from "@/db/projects"

import { createProjectMetadataAttestation } from "../eas"
import { uploadToPinata } from "../pinata"
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
    // TODO: Finalize data payload
    const { team, ...rest } = project
    const ipfsHash = await uploadToPinata(projectId, rest)

    // Create attestation
    // TODO: Real pinata gateway URL
    const attestationId = await createProjectMetadataAttestation({
      projectId: project.id,
      name: project.name,
      category: project.category ?? "",
      ipfsUrl: `https://op-atlas-test.mypinata.cloud/ipfs/${ipfsHash}`,
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
