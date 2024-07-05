"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import { addProjectSnapshot, getProject, updateProject } from "@/db/projects"

import { createProjectMetadataAttestation } from "../eas"
import { uploadToPinata } from "../pinata"
import { ProjectWithDetails } from "../types"
import { APPLICATIONS_CLOSED } from "../utils"
import { publishAndSaveApplication } from "./applications"
import { verifyMembership } from "./utils"

type ProjectMetadata = {
  name: string
  description: string | null
  projectAvatarUrl: string | null
  proejctCoverImageUrl: string | null
  category: string | null
  osoSlug: string | null
  socialLinks: {
    website: string[]
    farcaster: string[]
    twitter: string | null
    mirror: string | null
  }
  team: string[]
  github: string[]
  packages: string[]
  contracts: {
    address: string
    deploymentTxHash: string
    deployerAddress: string
    chainId: number
  }[]
  grantsAndFunding: {
    ventureFunding: {
      amount: string
      year: string
      details: string | null
    }[]
    grants: {
      grant: string | null
      link: string | null
      amount: string
      date: string
      details: string | null
    }[]
    revenue: {
      amount: string
      details: string | null
    }[]
  }
}

function formatProjectMetadata(project: ProjectWithDetails): ProjectMetadata {
  // Eliminate extraneous data from IPFS snapshots

  const team = project.team.map(({ user }) => user.farcasterId)
  const github = project.repos
    .filter((repo) => repo.type === "github")
    .map((repo) => repo.url)
  const packages = project.repos
    .filter((repo) => repo.type === "package")
    .map((repo) => repo.url)

  const contracts = project.contracts.map((contract) => ({
    address: contract.contractAddress,
    deploymentTxHash: contract.deploymentHash,
    deployerAddress: contract.deployerAddress,
    chainId: contract.chainId,
  }))

  const venture = project.funding
    .filter((funding) => funding.type === "venture")
    .map((funding) => ({
      amount: funding.amount,
      year: funding.receivedAt,
      details: funding.details,
    }))
  const revenue = project.funding
    .filter((funding) => funding.type === "revenue")
    .map((funding) => ({
      amount: funding.amount,
      details: funding.details,
    }))
  const grants = project.funding
    .filter(
      (funding) => funding.type !== "venture" && funding.type !== "revenue",
    )
    .map((funding) => ({
      grant: funding.grant,
      link: funding.grantUrl,
      amount: funding.amount,
      date: funding.receivedAt,
      details: funding.details,
    }))

  const metadata = {
    name: project.name,
    description: project.description,
    projectAvatarUrl: project.thumbnailUrl,
    proejctCoverImageUrl: project.bannerUrl,
    category: project.category,
    osoSlug: project.openSourceObserverSlug,
    socialLinks: {
      website: project.website,
      farcaster: project.farcaster,
      twitter: project.twitter,
      mirror: project.mirror,
    },
    team,
    github,
    packages,
    contracts,
    grantsAndFunding: {
      ventureFunding: venture,
      grants,
      revenue,
    },
  }

  return metadata
}

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
  //await updateProject({ id: projectId, project }) // Replace with updateAllForProject

  // Upload metadata to IPFS
  const ipfsHash = await uploadToPinata(projectId, project)

  const attestationId = await createProjectMetadataAttestation({
    farcasterId: parseInt(farcasterId),
    projectId: projectId,
    name: project.name,
    category: project.category ?? "",
    ipfsUrl: `https://storage.retrofunding.optimism.io/ipfs/${ipfsHash}`,
  })

  const snapshot = await addProjectSnapshot({
    projectId,
    ipfsHash,
    attestationId,
  })

  return new Response(JSON.stringify({ ipfsHash, attestationId, projectId }))
}
