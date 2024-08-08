"use server"

import { Application } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { sortBy } from "ramda"

import { auth } from "@/auth"
import { createApplication, getProject } from "@/db/projects"

import { createApplicationAttestation } from "../eas"
import { ProjectWithDetails } from "../types"
import { APPLICATIONS_CLOSED, getProjectStatus } from "../utils"
import { verifyMembership } from "./utils"

export const publishAndSaveApplication = async ({
  projects,
}: {
  projects: {
    projectId: string
    categories: string[]
    dependentEntities: string
    successMetrics: string
    additionalComments?: string
    attestationId: string
  }[]
}): Promise<Application> => {
  // Create application in database
  return await createApplication({
    projects,
    round: 5,
  })
}

const createProjectApplication = async (
  project: {
    projectId: string
    categories: string[]
    dependentEntities: string
    successMetrics: string
    additionalComments?: string
  },
  farcasterId: string,
) => {
  const isInvalid = await verifyMembership(project.projectId, farcasterId)
  if (isInvalid?.error) {
    return isInvalid
  }

  const projectData = await getProject({ id: project.projectId })

  if (!projectData) {
    return {
      error: "Project not found",
    }
  }

  // Project must be 100% complete
  const { progressPercent } = getProjectStatus(projectData)

  if (progressPercent !== 100) {
    return {
      error: "Project is not complete",
    }
  }

  // Issue attestation
  const latestSnapshot = sortBy(
    (snapshot) => -snapshot.createdAt,
    projectData.snapshots,
  )[0]

  const attestationId = await createApplicationAttestation({
    farcasterId: parseInt(farcasterId),
    projectId: project.projectId,
    round: 5,
    snapshotRef: latestSnapshot.attestationId,
  })

  const application = await publishAndSaveApplication({
    projects: [{ ...project, attestationId }],
  })

  return {
    application,
    error: null,
  }
}

export const submitApplications = async (
  projects: {
    categories: string[]
    dependentEntities: string
    successMetrics: string
    additionalComments?: string
    projectId: string
  }[],
) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      applications: [],
      error: "Unauthorized",
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
