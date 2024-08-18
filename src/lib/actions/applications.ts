"use server"

import { Application } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { sortBy } from "ramda"

import { auth } from "@/auth"
import { createApplication, getProject, updateApplication } from "@/db/projects"

import { createApplicationAttestation } from "../eas"
import { APPLICATIONS_CLOSED, getProjectStatus } from "../utils"
import { verifyMembership } from "./utils"

interface SubmitApplicationRequest {
  projectId: string
  attestationId: string
  categoryId: string
  impactStatement: Record<string, string>
  projectDescriptionOption: string
}

export const publishAndSaveApplication = async ({
  projects,
  applicationId,
}: {
  applicationId?: string
  projects: SubmitApplicationRequest[]
}): Promise<Application> => {
  // Create application in database
  return applicationId
    ? await updateApplication({
        applicationId,
        projects,
      })
    : await createApplication({
        projects,
        round: 5,
      })
}

const createProjectApplication = async (
  project: {
    projectId: string
    categoryId: string
    impactStatement: Record<string, string>
    projectDescriptionOption: string
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

  return {
    projects: { ...project, attestationId },
    error: null,
  }
}

export const submitApplications = async (
  projects: {
    projectId: string
    categoryId: string
    impactStatement: Record<string, string>
    projectDescriptionOption: string
  }[],
  applicationId?: string,
) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      applications: [],
      error: "Unauthorized",
    }
  }

  if (!session.user.email) {
    return {
      applications: [],
      error: "You must have an email to apply for application",
    }
  }

  if (APPLICATIONS_CLOSED) {
    throw new Error("Applications are closed")
  }

  const applications: Application[] = []
  let error: string | null = null

  const applicationFormData = <SubmitApplicationRequest[]>[]

  for (const project of projects) {
    const result = await createProjectApplication(
      project,
      session.user.farcasterId,
    )

    if (result.error === null && result.projects) {
      applicationFormData.push(result.projects)
    } else if (result.error) {
      error = result.error
    }
  }

  if (!!applicationFormData.length) {
    const applicationData = await publishAndSaveApplication({
      projects: applicationFormData,
      applicationId,
    })
    applications.push(applicationData)
  }

  revalidatePath("/dashboard")

  return {
    applications,
    error,
  }
}
