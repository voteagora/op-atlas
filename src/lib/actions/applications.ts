"use server"

import { Application } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { sortBy } from "ramda"

import { auth } from "@/auth"
import { createApplication, getProject } from "@/db/projects"
import { getUserById } from "@/db/users"

import { createApplicationAttestation } from "../eas"
import { APPLICATIONS_CLOSED, getProjectStatus } from "../utils"
import { verifyMembership } from "./utils"

interface SubmitApplicationRequest {
  projectId: string
  categoryId: string
  impactStatement: Record<string, string>
  projectDescriptionOptions: string[]
}

export const publishAndSaveApplication = async ({
  project,
  farcasterId,
  metadataSnapshotId,
}: {
  project: SubmitApplicationRequest
  farcasterId: string
  metadataSnapshotId: string
}): Promise<Application> => {
  // Publish attestation
  const attestationId = await createApplicationAttestation({
    farcasterId: parseInt(farcasterId),
    projectId: project.projectId,
    round: 4,
    snapshotRef: metadataSnapshotId,
  })

  // Create application in database
  return createApplication({
    round: 5,
    ...project,
    attestationId,
  })
}

const createProjectApplication = async (
  applicationData: SubmitApplicationRequest,
  farcasterId: string,
) => {
  const isInvalid = await verifyMembership(
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
    farcasterId,
    metadataSnapshotId: latestSnapshot.attestationId,
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

  if (APPLICATIONS_CLOSED) {
    throw new Error("Applications are closed")
  }

  const applications: Application[] = []
  let error: string | null = null

  for (const project of projects) {
    const result = await createProjectApplication(
      project,
      session.user.farcasterId,
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
