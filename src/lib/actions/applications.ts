"use server"

import { Application } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { sortBy } from "ramda"

import { auth } from "@/auth"
import { createApplication, getProject } from "@/db/projects"
import { getUserById } from "@/db/users"

import { createApplicationAttestation } from "../eas"
import { uploadToPinata } from "../pinata"
import { ApplicationWithDetails, CategoryWithImpact } from "../types"
import { APPLICATIONS_CLOSED, getProjectStatus } from "../utils"
import { formatApplicationMetadata } from "../utils/metadata"
import { verifyAdminStatus } from "./utils"

const whitelist = [
  "0x61400c6b679bc467d522c7124819332c8a660716c55ea71f76f708d6bc296c22",
  "0x008875f970469e090a5a843c68e3f8444e110a741990f03938e4ea42df8d11a2",
  "0xdff778291bf6893ac1c67540cb7b552781721138767dbf59dd1d1ba132a4c377",
  "0x09b585a065b43e85d9d86c9901b13fa80ac872228c57ffb23ed0063d1f2da28a",
  "0x850df51e29f2846a5f085d88e6b6fc13fad51ad7161f8a825ed09d470668161a",
  "0x8d7569742539aab697bd8825e7c49883743778b38b6090660fbdf84ec2c3938f",
]

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

  if (!user?.email) {
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
