"use server"

import { revalidatePath } from "next/cache"
import { sortBy } from "ramda"

import { auth } from "@/auth"
import { createApplication, getProject } from "@/db/projects"

import { createApplicationAttestation } from "../eas"
import { getProjectStatus } from "../utils"
import { verifyAdminStatus } from "./utils"

export const submitApplication = async (projectId: string) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const isInvalid = await verifyAdminStatus(projectId, session.user.farcasterId)
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

  const attestationId = await createApplicationAttestation({
    projectId: project.id,
    round: 4,
    snapshotRef: latestSnapshot.attestationId,
  })

  // Create application
  const application = await createApplication({
    projectId,
    attestationId,
    round: 4,
  })

  revalidatePath("/dashboard")

  return {
    application,
    error: null,
  }
}
