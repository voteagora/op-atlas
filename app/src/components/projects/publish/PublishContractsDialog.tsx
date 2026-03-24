"use client"

import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useRef, useState } from "react"

import { Badge } from "@/components/common/Badge"
import { LinearProgress } from "@/components/common/LinearProgress"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MIRADOR_FLOW } from "@/lib/mirador/constants"
import { withMiradorTraceHeaders } from "@/lib/mirador/headers"
import {
  addMiradorEvent,
  closeMiradorTrace,
  startMiradorTrace,
} from "@/lib/mirador/webTrace"

export type PublishProgress = {
  verifiedTotal: number
  publishedTotal: number
  pendingPublish: number
  pendingRevoke: number
}

type PublishContractsDialogProps = {
  projectId: string
  open: boolean
  onOpenChange: (next: boolean) => void
  onProgressUpdate?: (progress: PublishProgress) => void
  onComplete?: () => void
  onMetadataPublished?: (attestationId?: string) => void
}

type MiradorTraceInstance = NonNullable<ReturnType<typeof startMiradorTrace>>
type SnapshotResult = {
  error?: string | null
  metadataPending?: boolean
  pendingContracts?: {
    toPublish: number
    toRevoke: number
  }
  snapshot?: {
    attestationId?: string
  } | null
}
type ContractsBatchResult = {
  error?: string | null
  publishedThisBatch?: number
  revokedThisBatch?: number
  remainingPublish?: number
  remainingRevoke?: number
  totalVerified?: number
  totalPublished?: number
}
type FinalizeResult = {
  error?: string | null
  snapshot?: {
    attestationId?: string
  } | null
}

const DEFAULT_PROGRESS: PublishProgress = {
  verifiedTotal: 0,
  publishedTotal: 0,
  pendingPublish: 0,
  pendingRevoke: 0,
}

async function fetchProgress(projectId: string): Promise<PublishProgress> {
  const response = await fetch(
    `/api/projects/${projectId}/contracts/publish-progress`,
    { cache: "no-store" },
  )
  if (!response.ok) {
    throw new Error("Failed to fetch publish progress")
  }
  const data = (await response.json()) as PublishProgress
  return data
}

async function createProjectSnapshotWithTrace(
  projectId: string,
  traceId: string | null,
): Promise<SnapshotResult> {
  const response = await fetch(
    `/api/v1/projects/${projectId}/publish/snapshot`,
    {
      method: "POST",
      headers: withMiradorTraceHeaders(
        undefined,
        traceId,
        MIRADOR_FLOW.projectPublish,
      ),
    },
  )
  const payload = (await response.json()) as SnapshotResult
  if (!response.ok) {
    return {
      error: payload.error ?? "Failed to create project snapshot",
    }
  }
  return payload
}

async function publishContractsBatchWithTrace(
  projectId: string,
  traceId: string | null,
): Promise<ContractsBatchResult> {
  const response = await fetch(
    `/api/v1/projects/${projectId}/publish/contracts-batch`,
    {
      method: "POST",
      headers: withMiradorTraceHeaders(
        {
          "Content-Type": "application/json",
        },
        traceId,
        MIRADOR_FLOW.projectPublish,
      ),
      body: JSON.stringify({}),
    },
  )
  const payload = (await response.json()) as ContractsBatchResult
  if (!response.ok) {
    return {
      error: payload.error ?? "Failed to publish project contracts",
    }
  }
  return payload
}

async function finalizeProjectSnapshotWithTrace(
  projectId: string,
  traceId: string | null,
): Promise<FinalizeResult> {
  const response = await fetch(
    `/api/v1/projects/${projectId}/publish/finalize`,
    {
      method: "POST",
      headers: withMiradorTraceHeaders(
        undefined,
        traceId,
        MIRADOR_FLOW.projectPublish,
      ),
    },
  )
  const payload = (await response.json()) as FinalizeResult
  if (!response.ok) {
    return {
      error: payload.error ?? "Failed to finalize project snapshot",
    }
  }
  return payload
}

export function PublishContractsDialog({
  projectId,
  open,
  onOpenChange,
  onProgressUpdate,
  onComplete,
  onMetadataPublished,
}: PublishContractsDialogProps) {
  const { data: session } = useSession()
  const viewerId = session?.impersonation?.targetUserId ?? session?.user?.id

  const [progress, setProgress] = useState<PublishProgress>(DEFAULT_PROGRESS)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [metadataStatus, setMetadataStatus] = useState<
    "idle" | "pending" | "running" | "success" | "error"
  >("idle")
  const [metadataError, setMetadataError] = useState<string | null>(null)
  const [needsMetadataFinalization, setNeedsMetadataFinalization] =
    useState(false)
  const [phase, setPhase] = useState<"contracts" | "metadata" | "success">(
    "contracts",
  )
  const [retryKey, setRetryKey] = useState(0)

  const abortRef = useRef(false)
  const processingRef = useRef(false)
  const publishTraceRef = useRef<ReturnType<typeof startMiradorTrace>>(null)
  const pendingUnmountCloseTimeoutRef = useRef<number | null>(null)

  const cancelPendingUnmountClose = useCallback(() => {
    if (pendingUnmountCloseTimeoutRef.current !== null) {
      window.clearTimeout(pendingUnmountCloseTimeoutRef.current)
      pendingUnmountCloseTimeoutRef.current = null
    }
  }, [])

  const getPublishTraceId = () => {
    return publishTraceRef.current?.getTraceId() ?? null
  }

  const closePublishTrace = async (
    reason: string,
    eventName?: string,
    details?: Record<string, unknown>,
  ) => {
    const trace = publishTraceRef.current
    if (!trace) {
      return
    }
    cancelPendingUnmountClose()

    if (eventName) {
      addMiradorEvent(trace, eventName, details)
    }

    await closeMiradorTrace(trace, reason)
    publishTraceRef.current = null
  }

  const loadProgress = async () => {
    addMiradorEvent(
      publishTraceRef.current,
      "project_publish_progress_requested",
      {
        projectId,
      },
    )
    try {
      const snapshot = await fetchProgress(projectId)
      setProgress(snapshot)
      onProgressUpdate?.(snapshot)
      addMiradorEvent(
        publishTraceRef.current,
        "project_publish_progress_loaded",
        {
          projectId,
          verifiedTotal: snapshot.verifiedTotal,
          publishedTotal: snapshot.publishedTotal,
          pendingPublish: snapshot.pendingPublish,
          pendingRevoke: snapshot.pendingRevoke,
        },
      )
      return snapshot
    } catch (err) {
      console.error(err)
      setError("Failed to load contract publishing progress.")
      addMiradorEvent(
        publishTraceRef.current,
        "project_publish_progress_failed",
        {
          projectId,
          error: err instanceof Error ? err.message : String(err),
        },
      )
      return DEFAULT_PROGRESS
    }
  }

  const finalizeMetadata = async () => {
    if (!needsMetadataFinalization || abortRef.current) {
      addMiradorEvent(
        publishTraceRef.current,
        "project_publish_metadata_not_required",
        {
          projectId,
        },
      )
      setMetadataStatus("success")
      setPhase("success")
      onComplete?.()
      await closePublishTrace(
        "Project publish completed",
        "project_publish_trace_closed_success",
        { projectId, reason: "metadata_not_required" },
      )
      return
    }

    try {
      setPhase("metadata")
      setMetadataStatus("running")
      setMetadataError(null)
      addMiradorEvent(
        publishTraceRef.current,
        "project_publish_metadata_started",
        {
          projectId,
        },
      )

      const traceId = getPublishTraceId()
      const finalizeResult = await finalizeProjectSnapshotWithTrace(
        projectId,
        traceId,
      )
      if (abortRef.current) return

      if (
        !finalizeResult ||
        ("error" in finalizeResult && finalizeResult.error)
      ) {
        addMiradorEvent(
          publishTraceRef.current,
          "project_publish_metadata_failed",
          {
            projectId,
            error:
              typeof finalizeResult?.error === "string"
                ? finalizeResult.error
                : "Unknown metadata publish error",
          },
        )
        setMetadataStatus("error")
        setMetadataError(
          typeof finalizeResult?.error === "string"
            ? finalizeResult.error
            : "Failed to publish metadata. Please try again.",
        )
        return
      }

      setNeedsMetadataFinalization(false)
      setError(null)
      await loadProgress()
      if (abortRef.current) return

      addMiradorEvent(
        publishTraceRef.current,
        "project_publish_metadata_succeeded",
        {
          projectId,
          hasSnapshot:
            "snapshot" in finalizeResult && Boolean(finalizeResult.snapshot),
          attestationId:
            "snapshot" in finalizeResult && finalizeResult.snapshot
              ? finalizeResult.snapshot.attestationId
              : undefined,
        },
      )
      setMetadataStatus("success")
      setPhase("success")
      if ("snapshot" in finalizeResult && finalizeResult.snapshot) {
        onMetadataPublished?.(finalizeResult.snapshot.attestationId)
      } else {
        onMetadataPublished?.()
      }
      onComplete?.()
      await closePublishTrace(
        "Project publish completed",
        "project_publish_trace_closed_success",
        { projectId, reason: "metadata_success" },
      )
    } catch (err) {
      console.error(err)
      addMiradorEvent(
        publishTraceRef.current,
        "project_publish_metadata_exception",
        {
          projectId,
          error: err instanceof Error ? err.message : String(err),
        },
      )
      setMetadataStatus("error")
      setMetadataError("Failed to publish metadata. Please try again.")
    }
  }

  const processBatches = async (initialState?: PublishProgress) => {
    if (processingRef.current || abortRef.current) return
    processingRef.current = true
    setIsProcessing(true)
    addMiradorEvent(
      publishTraceRef.current,
      "project_publish_batches_started",
      {
        projectId,
        initialState,
      },
    )

    let current = initialState ?? progress
    if (initialState) {
      setProgress(initialState)
      onProgressUpdate?.(initialState)
    }

    try {
      while (!abortRef.current) {
        const hasPending =
          current.pendingPublish > 0 || current.pendingRevoke > 0
        if (!hasPending) {
          addMiradorEvent(
            publishTraceRef.current,
            "project_publish_batches_no_pending",
            {
              projectId,
            },
          )
          break
        }

        const previous = current
        const traceId = getPublishTraceId()
        const batchResult = await publishContractsBatchWithTrace(
          projectId,
          traceId,
        )

        if (!batchResult || batchResult.error) {
          addMiradorEvent(
            publishTraceRef.current,
            "project_publish_batch_failed",
            {
              projectId,
              error:
                typeof batchResult?.error === "string"
                  ? batchResult.error
                  : "Unknown batch publish error",
            },
          )
          setError(
            typeof batchResult?.error === "string"
              ? batchResult.error
              : "Failed to publish contracts. Please try again.",
          )
          return
        }

        if (
          !("totalVerified" in batchResult) ||
          !("totalPublished" in batchResult)
        ) {
          addMiradorEvent(
            publishTraceRef.current,
            "project_publish_batch_invalid_response",
            {
              projectId,
            },
          )
          setError("Failed to publish contracts. Please try again.")
          return
        }

        current = {
          verifiedTotal: batchResult.totalVerified ?? previous.verifiedTotal,
          publishedTotal: batchResult.totalPublished ?? previous.publishedTotal,
          pendingPublish:
            batchResult.remainingPublish ?? previous.pendingPublish,
          pendingRevoke: batchResult.remainingRevoke ?? previous.pendingRevoke,
        }

        const madeProgress =
          current.pendingPublish < previous.pendingPublish ||
          current.pendingRevoke < previous.pendingRevoke ||
          current.publishedTotal > previous.publishedTotal

        addMiradorEvent(
          publishTraceRef.current,
          "project_publish_batch_succeeded",
          {
            projectId,
            previousPendingPublish: previous.pendingPublish,
            previousPendingRevoke: previous.pendingRevoke,
            pendingPublish: current.pendingPublish,
            pendingRevoke: current.pendingRevoke,
            publishedTotal: current.publishedTotal,
            madeProgress,
          },
        )

        if (!madeProgress) {
          addMiradorEvent(
            publishTraceRef.current,
            "project_publish_batch_stalled",
            {
              projectId,
              pendingPublish: current.pendingPublish,
              pendingRevoke: current.pendingRevoke,
              publishedTotal: current.publishedTotal,
            },
          )
          setError(
            "Publishing stalled because no progress could be made. Please try again shortly.",
          )
          return
        }

        setProgress(current)
        onProgressUpdate?.(current)
      }

      if (!abortRef.current) {
        await finalizeMetadata()
      }
    } catch (err) {
      console.error(err)
      addMiradorEvent(
        publishTraceRef.current,
        "project_publish_batches_exception",
        {
          projectId,
          error: err instanceof Error ? err.message : String(err),
        },
      )
      setError("Failed to publish contracts. Please try again.")
    } finally {
      processingRef.current = false
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    cancelPendingUnmountClose()

    if (!open) {
      const trace = publishTraceRef.current
      if (trace) {
        addMiradorEvent(trace, "project_publish_dialog_closed", { projectId })
        void closeMiradorTrace(trace, "Project publish dialog closed")
        publishTraceRef.current = null
      }
      return
    }

    if (publishTraceRef.current) {
      return
    }

    const trace = startMiradorTrace({
      name: "ProjectPublish",
      flow: MIRADOR_FLOW.projectPublish,
      context: {
        source: "frontend",
        userId: viewerId ? String(viewerId) : undefined,
        projectId,
        sessionId: session?.user?.id,
      },
      attributes: {
        projectId,
        phase: "contracts",
      },
      tags: ["project_publish", "frontend"],
    })

    publishTraceRef.current = trace
    addMiradorEvent(trace, "project_publish_dialog_opened", { projectId })
  }, [cancelPendingUnmountClose, open, projectId, session?.user?.id, viewerId])

  useEffect(() => {
    return () => {
      const trace = publishTraceRef.current
      if (trace) {
        cancelPendingUnmountClose()
        pendingUnmountCloseTimeoutRef.current = window.setTimeout(() => {
          if (publishTraceRef.current !== trace) {
            return
          }

          addMiradorEvent(trace, "project_publish_trace_closed_on_unmount", {
            projectId,
          })
          void closeMiradorTrace(trace, "Project publish dialog unmounted")
          publishTraceRef.current = null
          pendingUnmountCloseTimeoutRef.current = null
        }, 0)
      }
    }
  }, [cancelPendingUnmountClose, projectId])

  useEffect(() => {
    abortRef.current = !open
    if (!open) {
      setPhase("contracts")
      setMetadataStatus("idle")
      setMetadataError(null)
      setError(null)
      setProgress(DEFAULT_PROGRESS)
      setIsProcessing(false)
      setNeedsMetadataFinalization(false)
      processingRef.current = false
      return
    }

    addMiradorEvent(publishTraceRef.current, "project_publish_flow_started", {
      projectId,
    })
    setPhase("contracts")
    setMetadataStatus("running")
    setMetadataError(null)
    setError(null)
    setProgress(DEFAULT_PROGRESS)
    setIsProcessing(false)
    setNeedsMetadataFinalization(false)
    processingRef.current = false

    const run = async () => {
      try {
        addMiradorEvent(
          publishTraceRef.current,
          "project_publish_snapshot_requested",
          {
            projectId,
          },
        )
        const traceId = getPublishTraceId()
        const snapshotResult = await createProjectSnapshotWithTrace(
          projectId,
          traceId,
        )
        if (abortRef.current) return

        if (!snapshotResult || snapshotResult.error) {
          addMiradorEvent(
            publishTraceRef.current,
            "project_publish_snapshot_failed",
            {
              projectId,
              error:
                typeof snapshotResult?.error === "string"
                  ? snapshotResult.error
                  : "Unknown snapshot error",
            },
          )
          setMetadataStatus("error")
          setMetadataError(
            typeof snapshotResult?.error === "string"
              ? snapshotResult.error
              : "Failed to start publishing. Please try again.",
          )
          return
        }

        if (
          "metadataPending" in snapshotResult &&
          !snapshotResult.metadataPending
        ) {
          addMiradorEvent(
            publishTraceRef.current,
            "project_publish_snapshot_succeeded",
            {
              projectId,
              metadataPending: false,
              attestationId:
                "snapshot" in snapshotResult && snapshotResult.snapshot
                  ? snapshotResult.snapshot.attestationId
                  : undefined,
            },
          )
          setPhase("metadata")
          setError(null)
          await loadProgress()
          if (abortRef.current) return

          setMetadataStatus("success")
          setPhase("success")
          if ("snapshot" in snapshotResult && snapshotResult.snapshot) {
            onMetadataPublished?.(snapshotResult.snapshot.attestationId)
          } else {
            onMetadataPublished?.()
          }
          onComplete?.()
          await closePublishTrace(
            "Project publish completed",
            "project_publish_trace_closed_success",
            { projectId, reason: "snapshot_without_batching" },
          )
          return
        }

        addMiradorEvent(
          publishTraceRef.current,
          "project_publish_snapshot_succeeded",
          {
            projectId,
            metadataPending: true,
            pendingContracts:
              "pendingContracts" in snapshotResult
                ? snapshotResult.pendingContracts
                : undefined,
          },
        )
        setNeedsMetadataFinalization(true)
        setMetadataStatus("pending")

        const snapshot = await loadProgress()
        if (abortRef.current) return

        const hasWork =
          (snapshot.pendingPublish ?? 0) > 0 ||
          (snapshot.pendingRevoke ?? 0) > 0

        if (hasWork) {
          await processBatches(snapshot)
        } else {
          await finalizeMetadata()
        }
      } catch (err) {
        console.error(err)
        addMiradorEvent(
          publishTraceRef.current,
          "project_publish_flow_exception",
          {
            projectId,
            error: err instanceof Error ? err.message : String(err),
          },
        )
        setMetadataStatus("error")
        setMetadataError("Failed to start publishing. Please try again.")
      }
    }

    run()

    return () => {
      abortRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectId, retryKey, onMetadataPublished, onComplete])

  const handleRetryMetadata = () => {
    addMiradorEvent(
      publishTraceRef.current,
      "project_publish_retry_metadata_requested",
      {
        projectId,
        needsMetadataFinalization,
      },
    )
    setMetadataError(null)
    if (needsMetadataFinalization) {
      finalizeMetadata()
    } else {
      setRetryKey((attempt) => attempt + 1)
    }
  }

  const handleRetryContracts = () => {
    if (isProcessing || abortRef.current) {
      return
    }
    addMiradorEvent(
      publishTraceRef.current,
      "project_publish_retry_contracts_requested",
      {
        projectId,
        pendingPublish: progress.pendingPublish,
        pendingRevoke: progress.pendingRevoke,
      },
    )
    setError(null)
    processBatches(progress)
  }

  const publishedCount = progress.publishedTotal
  const totalContracts = progress.verifiedTotal
  const remainingContracts = progress.pendingPublish
  const remainingRevocations = progress.pendingRevoke
  const totalRemaining = remainingContracts + remainingRevocations
  const progressHelperText =
    remainingRevocations > 0
      ? `${remainingRevocations} outdated attestation${
          remainingRevocations === 1 ? "" : "s"
        } awaiting revocation`
      : totalRemaining > 0
      ? `${totalRemaining} contract${totalRemaining === 1 ? "" : "s"} remaining`
      : "All contracts are published onchain"

  const showProgress = totalContracts > 0
  const showContractSpinner =
    phase === "contracts" &&
    !error &&
    (isProcessing ||
      metadataStatus === "pending" ||
      metadataStatus === "running")

  const completed = metadataStatus === "success" && totalRemaining === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-4">
          <DialogTitle className="flex flex-col items-center gap-4">
            <span className="text-base font-semibold text-center">
              Publishing project onchain
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 w-full text-center">
          {showProgress && (
            <LinearProgress
              current={publishedCount}
              total={totalContracts}
              label="Contracts published"
              helperText={progressHelperText}
              className="w-full max-w-xs sm:max-w-sm"
            />
          )}

          {showContractSpinner && (
            <div className="flex items-center gap-2 text-sm text-secondary-foreground">
              <Loader2 size={18} className="animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-destructive-foreground">{error}</p>
              <Button
                type="button"
                variant="secondary"
                onClick={handleRetryContracts}
              >
                Retry contract publish
              </Button>
            </div>
          )}

          {metadataStatus === "pending" && !error && !isProcessing && (
            <p className="text-sm text-secondary-foreground">
              Waiting for contract attestations to finish…
            </p>
          )}

          {metadataStatus === "running" && phase === "metadata" && (
            <div className="flex items-center gap-2 text-sm text-secondary-foreground">
              <Loader2 size={18} className="animate-spin" />
              <span>Publishing metadata onchain…</span>
            </div>
          )}

          {metadataStatus === "error" && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-destructive-foreground">
                {metadataError ??
                  "Failed to publish metadata. Please try again."}
              </p>
              <Button
                type="button"
                variant="secondary"
                onClick={handleRetryMetadata}
              >
                Retry metadata publish
              </Button>
            </div>
          )}

          {metadataStatus === "success" && (
            <div className="flex flex-col items-center gap-3">
              <Badge accent text="Publish complete" />
              <p className="text-sm text-success">
                All contracts and metadata are now published onchain.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
