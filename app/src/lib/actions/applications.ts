"use server"

import { Application } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { sortBy } from "ramda"

import { auth } from "@/auth"
import { createApplication, getProject } from "@/db/projects"
import { getUserById } from "@/db/users"

import { createApplicationAttestation } from "../eas"
import { uploadToPinata } from "../pinata"
import { CategoryWithImpact } from "../types"
import { APPLICATIONS_CLOSED, getProjectStatus } from "../utils"
import { formatApplicationMetadata } from "../utils/metadata"
import { verifyAdminStatus } from "./utils"

const whitelist: string[] = []

interface SubmitApplicationRequest {
  projectId: string
  categoryId: string
  impactStatement: Record<string, string>
  projectDescriptionOptions: string[]
}

export const publishAndSaveApplication = async ({
  project,
  category,
  farcasterId,
  metadataSnapshotId,
  round,
}: {
  project: SubmitApplicationRequest
  category: CategoryWithImpact
  farcasterId: string
  metadataSnapshotId: string
  round: number
}): Promise<Application> => {
  // Upload metadata to IPFS
  const metadata = formatApplicationMetadata({
    round,
    categoryId: project.categoryId,
    impactStatement: project.impactStatement,
    category,
    projectDescriptionOptions: project.projectDescriptionOptions,
  })
  const ipfsHash = await uploadToPinata(project.projectId, metadata)

  // Publish attestation
  const attestationId = await createApplicationAttestation({
    farcasterId: parseInt(farcasterId),
    projectId: project.projectId,
    round,
    snapshotRef: metadataSnapshotId,
    ipfsUrl: `https://storage.retrofunding.optimism.io/ipfs/${ipfsHash}`,
  })

  // Create application in database
  return createApplication({
    round,
    ...project,
    attestationId,
  })
}

const createProjectApplication = async (
  applicationData: SubmitApplicationRequest,
  farcasterId: string,
  round: number,
  category: CategoryWithImpact,
) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      applications: [],
      error: "Unauthorized",
    }
  }

  const isInvalid = await verifyAdminStatus(
    applicationData.projectId,
    farcasterId,
  )
  if (isInvalid?.error) {
    return isInvalid
  }

  const project = await getProject({ id: applicationData.projectId })

  if (!project) {
    return {
      error: "Project not found",
    }
  }

  // Project must be 100% complete
  const { progressPercent } = getProjectStatus(project)

  if (progressPercent !== 100) {
    return {
      error: "Project is not complete",
    }
  }

  // Issue attestation
  const latestSnapshot = sortBy(
    (snapshot) => -snapshot.createdAt,
    project.snapshots,
  )[0]

  const application = await publishAndSaveApplication({
    project: {
      projectId: project.id,
      categoryId: applicationData.categoryId,
      impactStatement: applicationData.impactStatement,
      projectDescriptionOptions: applicationData.projectDescriptionOptions,
    },
    category,
    farcasterId,
    metadataSnapshotId: latestSnapshot.attestationId,
    round,
  })

  return {
    application,
    error: null,
  }
}

export const submitApplications = async (
  projects: {
    projectId: string
    categoryId: string
    impactStatement: Record<string, string>
    projectDescriptionOptions: string[]
  }[],
  round: number,
  categories: CategoryWithImpact[],
) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      applications: [],
      error: "Unauthorized",
    }
  }

  const user = await getUserById(session.user.id)

  if (user?.emails.length === 0) {
    return {
      applications: [],
      error: "You must provide an email to apply.",
    }
  }

  const isWhitelisted = projects.some((project) =>
    whitelist.includes(project.projectId),
  )

  if (APPLICATIONS_CLOSED && !isWhitelisted) {
    throw new Error("Applications are closed")
  }

  const applications: Application[] = []
  let error: string | null = null

  for (const project of projects) {
    const result = await createProjectApplication(
      project,
      session.user.farcasterId,
      round,
      categories.find((category) => category.id === project.categoryId)!,
    )
    if (result.error === null && result.application) {
      applications.push(result.application)
    } else if (result.error) {
      error = result.error
    }
  }

  revalidatePath("/dashboard")

  return {
    applications,
    error,
  }
}
