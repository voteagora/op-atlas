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
    const { team, contracts, snapshots, applications, ...rest } = project

    const redactedContracts = contracts.map((contract) => ({
      id: contract.id,
      contractAddress: contract.contractAddress,
      deployerAddress: contract.deployerAddress,
      deploymentHash: contract.deploymentHash,
      chainId: contract.chainId,
    }))

    const redactedTeam = team.map(({ user }) => ({
      farcasterId: user.farcasterId,
      username: user.username,
      avatar: user.imageUrl,
      name: user.name,
      bio: user.bio,
    }))

    const metadata = {
      ...rest,
      contracts: redactedContracts,
      team: redactedTeam,
    }

    const ipfsHash = await uploadToPinata(projectId, metadata)

    // Create attestation
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
