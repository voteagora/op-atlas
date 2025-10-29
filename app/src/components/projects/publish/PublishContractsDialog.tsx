"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

import { Badge } from "@/components/common/Badge"
import { LinearProgress } from "@/components/common/LinearProgress"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  createProjectSnapshot,
  finalizeProjectSnapshot,
  publishProjectContractsBatch,
} from "@/lib/actions/snapshots"

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

export function PublishContractsDialog({
  projectId,
  open,
  onOpenChange,
  onProgressUpdate,
  onComplete,
  onMetadataPublished,
}: PublishContractsDialogProps) {
  const [progress, setProgress] =
    useState<PublishProgress>(DEFAULT_PROGRESS)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [metadataStatus, setMetadataStatus] = useState<
    "idle" | "pending" | "running" | "success" | "error"
  >("idle")
  const [metadataError, setMetadataError] = useState<string | null>(null)
  const [needsMetadataFinalization, setNeedsMetadataFinalization] =
    useState(false)
  const [phase, setPhase] =
    useState<"contracts" | "metadata" | "success">("contracts")
  const [retryKey, setRetryKey] = useState(0)

  const abortRef = useRef(false)
  const processingRef = useRef(false)

  const loadProgress = async () => {
    try {
      const snapshot = await fetchProgress(projectId)
      setProgress(snapshot)
      onProgressUpdate?.(snapshot)
      return snapshot
    } catch (err) {
      console.error(err)
      setError("Failed to load contract publishing progress.")
      return DEFAULT_PROGRESS
    }
  }

  const finalizeMetadata = async () => {
    if (!needsMetadataFinalization || abortRef.current) {
      setMetadataStatus("success")
      setPhase("success")
      onComplete?.()
      return
    }

    try {
      setPhase("metadata")
      setMetadataStatus("running")
      setMetadataError(null)

      const finalizeResult = await finalizeProjectSnapshot(projectId)
      if (abortRef.current) return

      if (!finalizeResult || finalizeResult.error) {
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

      setMetadataStatus("success")
      setPhase("success")
      onMetadataPublished?.(finalizeResult.snapshot?.attestationId)
      onComplete?.()
    } catch (err) {
      console.error(err)
      setMetadataStatus("error")
      setMetadataError("Failed to publish metadata. Please try again.")
    }
  }

  const processBatches = async (initialState?: PublishProgress) => {
    if (processingRef.current || abortRef.current) return
    processingRef.current = true
    setIsProcessing(true)

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
          break
        }

        const previous = current
        const batchResult = await publishProjectContractsBatch({ projectId })

        if (!batchResult || batchResult.error) {
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
          setError("Failed to publish contracts. Please try again.")
          return
        }

        current = {
          verifiedTotal: batchResult.totalVerified,
          publishedTotal: batchResult.totalPublished,
          pendingPublish: batchResult.remainingPublish,
          pendingRevoke: batchResult.remainingRevoke,
        }

        const madeProgress =
          current.pendingPublish < previous.pendingPublish ||
          current.pendingRevoke < previous.pendingRevoke ||
          current.publishedTotal > previous.publishedTotal

        if (!madeProgress) {
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
      setError("Failed to publish contracts. Please try again.")
    } finally {
      processingRef.current = false
      setIsProcessing(false)
    }
  }

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
        const snapshotResult = await createProjectSnapshot(projectId)
        if (abortRef.current) return

        if (!snapshotResult || snapshotResult.error) {
          setMetadataStatus("error")
          setMetadataError(
            typeof snapshotResult?.error === "string"
              ? snapshotResult.error
              : "Failed to start publishing. Please try again.",
          )
          return
        }

        if (!snapshotResult.metadataPending) {
          setPhase("metadata")
          setError(null)
          await loadProgress()
          if (abortRef.current) return

          setMetadataStatus("success")
          setPhase("success")
          onMetadataPublished?.(snapshotResult.snapshot?.attestationId)
          onComplete?.()
          return
        }

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
        setMetadataStatus("error")
        setMetadataError("Failed to start publishing. Please try again.")
      }
    }

    run()

    return () => {
      abortRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    projectId,
    retryKey,
    onMetadataPublished,
    onComplete,
  ])

  const handleRetryMetadata = () => {
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
      ? `${remainingRevocations} outdated attestation${remainingRevocations === 1 ? "" : "s"} awaiting revocation`
      : totalRemaining > 0
        ? `${totalRemaining} contract${totalRemaining === 1 ? "" : "s"} remaining`
        : "All contracts are published onchain"

  const showProgress = totalContracts > 0
  const showContractSpinner =
    phase === "contracts" &&
    !error &&
    (isProcessing || metadataStatus === "pending" || metadataStatus === "running")

  const completed =
    metadataStatus === "success" &&
    totalRemaining === 0

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
              <span>Publishing verified contracts…</span>
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
