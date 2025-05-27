"use server"

import { Application } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { sortBy } from "ramda"

import { auth } from "@/auth"
import {
  createApplication,
  getProject,
  getProjectContracts,
} from "@/db/projects"
import { getUserById } from "@/db/users"

import { createApplicationAttestation } from "../eas"
import { CategoryWithImpact } from "../types"
import { getProjectStatus } from "../utils"
import { getUserApplicationsForRound } from "./projects"
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
  roundName,
}: {
  project: SubmitApplicationRequest
  category: CategoryWithImpact
  farcasterId: string
  metadataSnapshotId: string
  round: number
  roundName?: string
}): Promise<Application> => {
  // Publish attestation
  const attestationId = await createApplicationAttestation({
    farcasterId: parseInt(farcasterId),
    projectId: project.projectId,
    round: `${roundName ?? round}`,
    snapshotRef: "", // Skipping snapshot for S7
    ipfsUrl: "", // Skipping IPFS for S7
  })

  // Create application in database
  return createApplication({
    round: round,
    ...project,
    attestationId,
  })
}

const createProjectApplication = async (
  applicationData: SubmitApplicationRequest,
  farcasterId: string,
  round: number,
  category: CategoryWithImpact,
  roundName?: string,
) => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return {
      applications: [],
      error: "Unauthorized",
    }
  }

  const isInvalid = await verifyAdminStatus(applicationData.projectId, userId)
  if (isInvalid?.error) {
    return isInvalid
  }

  const [project, contracts] = await Promise.all([
    getProject({ id: applicationData.projectId }),
    getProjectContracts({
      projectId: applicationData.projectId,
    }),
  ])

  if (!project) {
    return {
      error: "Project not found",
    }
  }

  // Project must be 100% complete
  const { progressPercent } = getProjectStatus(project, contracts)

  if (progressPercent !== 100) {
    return {
      error: "Project is not complete",
    }
  }

  const applications = await getUserApplicationsForRound(
    session?.user?.id,
    round,
  )

  const result = applications.find(
    (application) => application.projectId === project.id,
  )

  console.log(result)

  if (result) {
    return { error: "Project has already been submitted to this round!" }
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
    roundName,
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
  // round: MissionData,
  roundStartDate: Date,
  roundName: string,
  roundNumber: number,
  categories?: CategoryWithImpact[],
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

  // const isWhitelisted = projects.some((project) =>
  //   whitelist.includes(project.projectId),
  // )

  // if (APPLICATIONS_CLOSED && !isWhitelisted) {
  //   throw new Error("Applications are closed")
  // }

  const isOpenForEnrollment = roundStartDate < new Date()

  if (!isOpenForEnrollment) {
    throw new Error("Applications are closed")
  }

  const applications: Application[] = []
  let error: string | null = null

  for (const project of projects) {
    const result = await createProjectApplication(
      project,
      session.user?.farcasterId ?? 0,
      roundNumber,
      categories?.find((category) => category.id === project.categoryId)!,
      roundName,
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
