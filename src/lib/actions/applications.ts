"use server"

import { Application } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { sortBy } from "ramda"

import { auth } from "@/auth"
import { createApplication, getProject } from "@/db/projects"

import { createApplicationAttestation } from "../eas"
import { getProjectStatus } from "../utils"
import { verifyAdminStatus } from "./utils"

export const publishAndSaveApplication = async ({
  projectId,
  farcasterId,
  metadataSnapshotId,
}: {
  projectId: string
  farcasterId: string
  metadataSnapshotId: string
}): Promise<Application> => {
  // Publish attestation
  const attestationId = await createApplicationAttestation({
    farcasterId: parseInt(farcasterId),
    projectId,
    round: 4,
    snapshotRef: metadataSnapshotId,
  })

  // Create application in database
  return await createApplication({
    projectId,
    attestationId,
    round: 4,
  })
}

const createProjectApplication = async (
  projectId: string,
  farcasterId: string,
) => {
  const isInvalid = await verifyAdminStatus(projectId, farcasterId)
  if (isInvalid?.error) {
    return isInvalid
  }

  const project = await getProject({ id: projectId })

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
    projectId,
    farcasterId,
    metadataSnapshotId: latestSnapshot.id,
  })

  return {
    application,
    error: null,
  }
}

export const submitApplications = async (projectIds: string[]) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const results = await Promise.all(
    projectIds.map((projectId) =>
      createProjectApplication(projectId, session.user.farcasterId),
    ),
  )

  const applications: Application[] = []
  let error: Error | null = null

  results.forEach((result) => {
    if (result.error === null && result.application) {
      applications.push(result.application)
    } else if (result.error) {
      error = new Error(result.error)
    }
  })

  revalidatePath("/dashboard")

  return {
    applications,
    error,
  }
}
