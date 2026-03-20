"use server"

import { Application } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { sortBy } from "ramda"

import {
  createApplication,
  getProjectContractsWithClient,
  getProjectWithClient,
  getUserApplicationsWithClient,
} from "@/db/projects"
import { getUserById } from "@/db/users"
import { SessionContext, withImpersonation } from "@/lib/db/sessionContext"
import { extractFailedEasTxContext } from "@/lib/eas/txContext"
import { getMiradorChainNameFromChainId } from "@/lib/mirador/chains"

import { createApplicationAttestationWithTx } from "../eas/serverOnly"
import {
  appendServerTraceEvent,
  withMiradorTraceStep,
} from "../mirador/serverTrace"
import { MiradorTraceContext } from "../mirador/types"
import { CategoryWithImpact } from "../types"
import { getProjectStatus } from "../utils"
import { verifyAdminStatus } from "./utils"

const whitelist: string[] = []

interface SubmitApplicationRequest {
  projectId: string
  categoryId: string
  impactStatement: Record<string, string>
  projectDescriptionOptions: string[]
}

export const publishAndSaveApplication = async (
  {
    project,
    category,
    farcasterId,
    metadataSnapshotId,
    round,
    roundName,
    traceContext,
  }: {
    project: SubmitApplicationRequest
    category: CategoryWithImpact
    farcasterId: string
    metadataSnapshotId: string
    round: number
    roundName?: string
    traceContext?: MiradorTraceContext
  },
  ctx: SessionContext,
): Promise<Application> => {
  await appendServerTraceEvent({
    traceContext: withMiradorTraceStep(
      traceContext,
      "application_attestation_start",
      "backend",
    ),
    eventName: "application_attestation_started",
    details: {
      projectId: project.projectId,
      round: roundName ?? round,
      metadataSnapshotId,
    },
    tags: ["application", "attestation"],
  })

  try {
    // Publish attestation (must reference an existing metadata snapshot)
    const {
      attestationId,
      txHash,
      chainId,
      txInputData,
    } = await createApplicationAttestationWithTx({
      farcasterId: parseInt(farcasterId),
      projectId: project.projectId,
      round: `${roundName ?? round}`,
      snapshotRef: metadataSnapshotId,
      ipfsUrl: "", // Skipping IPFS for S7
    })

    // Create application in database
    const application = await createApplication(
      {
        round: round,
        ...project,
        attestationId,
      },
      { db: ctx.db, session: ctx.session },
    )
    const miradorChain = getMiradorChainNameFromChainId(chainId)

    await appendServerTraceEvent({
      traceContext: withMiradorTraceStep(
        traceContext,
        "application_attestation_success",
        "backend",
      ),
      eventName: "application_attestation_succeeded",
      details: {
        projectId: project.projectId,
        attestationId,
        round: roundName ?? round,
      },
      tags: ["application", "attestation"],
      txHashHints:
        txHash && miradorChain
          ? [
              {
                txHash,
                chain: miradorChain,
                details: "Application attestation transaction",
              },
            ]
          : undefined,
      txInputData,
    })

    return application
  } catch (error) {
    const failedTxContext = extractFailedEasTxContext(error)
    const failedMiradorChain = getMiradorChainNameFromChainId(
      failedTxContext.chainId,
    )

    await appendServerTraceEvent({
      traceContext: withMiradorTraceStep(
        traceContext,
        "application_attestation_exception",
        "backend",
      ),
      eventName: "application_attestation_failed",
      details: {
        projectId: project.projectId,
        error: error instanceof Error ? error.message : String(error),
      },
      tags: ["application", "attestation", "error"],
      txHashHints:
        failedTxContext.txHash && failedMiradorChain
          ? [
              {
                txHash: failedTxContext.txHash,
                chain: failedMiradorChain,
                details: "Failed application attestation transaction",
              },
            ]
          : undefined,
      txInputData: failedTxContext.txInputData,
    })

    throw error
  }
}

const createProjectApplication = async (
  ctx: SessionContext,
  applicationData: SubmitApplicationRequest,
  farcasterId: string,
  round: number,
  category: CategoryWithImpact,
  roundName?: string,
  traceContext?: MiradorTraceContext,
) => {
  const { db, userId } = ctx

  if (!userId) {
    return {
      error: "Unauthorized",
    }
  }

  const isInvalid = await verifyAdminStatus(
    applicationData.projectId,
    userId,
    ctx.db,
  )
  if (isInvalid?.error) {
    return isInvalid
  }

  const [project, contracts] = await Promise.all([
    getProjectWithClient({ id: applicationData.projectId }, db),
    getProjectContractsWithClient(
      {
        projectId: applicationData.projectId,
      },
      db,
    ),
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

  const applications = await getUserApplicationsWithClient(
    { userId, roundId: round.toString() },
    db,
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

  // Ensure a real snapshot exists; applications must reference a metadata snapshot
  if (!latestSnapshot?.attestationId) {
    return { error: "Project has no snapshot" }
  }

  const application = await publishAndSaveApplication(
    {
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
      traceContext,
    },
    ctx,
  )

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
  traceContext?: MiradorTraceContext,
) => {
  return withImpersonation(
    async (ctx) => {
      const { userId, db, session } = ctx

      if (!userId) {
        return {
          applications: [],
          error: "Unauthorized",
        }
      }

      const user = await getUserById(userId, db, session)

      if (user?.emails.length === 0) {
        return {
          applications: [],
          error: "You must provide an email to apply.",
        }
      }

      const isOpenForEnrollment = roundStartDate < new Date()

      if (!isOpenForEnrollment) {
        throw new Error("Applications are closed")
      }

      const applications: Application[] = []
      let error: string | null = null

      for (const project of projects) {
        const result = await createProjectApplication(
          ctx,
          project,
          user?.farcasterId ?? "0",
          roundNumber,
          categories?.find((category) => category.id === project.categoryId)!,
          roundName,
          traceContext,
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
    },
    { requireUser: true },
  )
}
