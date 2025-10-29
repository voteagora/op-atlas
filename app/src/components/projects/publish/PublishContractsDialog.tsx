"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

import { Badge } from "@/components/common/Badge"
import { LinearProgress } from "@/components/common/LinearProgress"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  createProjectSnapshot,
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
    "idle" | "running" | "success" | "error"
  >("idle")
  const [metadataError, setMetadataError] = useState<string | null>(null)
  const [metadataAttempt, setMetadataAttempt] = useState(0)
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

  useEffect(() => {
    abortRef.current = !open
    if (!open) {
      setMetadataStatus("idle")
      setMetadataError(null)
      setError(null)
      setProgress(DEFAULT_PROGRESS)
      setIsProcessing(false)
      processingRef.current = false
      return
    }

    setMetadataStatus("running")
    setMetadataError(null)
    setError(null)
    setProgress(DEFAULT_PROGRESS)
    setIsProcessing(false)
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
              : "Failed to publish metadata. Please try again.",
          )
          return
        }

        const snapshotAttestationId = snapshotResult.snapshot?.attestationId

        setMetadataStatus("success")
        onMetadataPublished?.(snapshotAttestationId)

        const snapshot = await loadProgress()
        if (abortRef.current) return

        const hasWork =
          (snapshot.pendingPublish ?? 0) > 0 ||
          (snapshot.pendingRevoke ?? 0) > 0

        if (hasWork) {
          await processBatches(snapshot)
        } else {
          onComplete?.()
        }
      } catch (err) {
        console.error(err)
        setMetadataStatus("error")
        setMetadataError("Failed to publish metadata. Please try again.")
      }
    }

    run()

    return () => {
      abortRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectId, metadataAttempt, onMetadataPublished, onComplete])

  const processBatches = async (initialState?: PublishProgress) => {
    if (processingRef.current || abortRef.current) return
    processingRef.current = true
    setIsProcessing(true)

    try {
      let current = initialState ?? progress
      if (initialState) {
        setProgress(initialState)
        onProgressUpdate?.(initialState)
      }
      while (!abortRef.current) {
        const hasPending =
          current.pendingPublish > 0 || current.pendingRevoke > 0
        if (!hasPending) {
          onComplete?.()
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
          break
        }

        if (
          !("totalVerified" in batchResult) ||
          !("totalPublished" in batchResult)
        ) {
          setError("Failed to publish contracts. Please try again.")
          break
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
          break
        }

        setProgress(current)
        onProgressUpdate?.(current)

        if (
          current.pendingPublish === 0 &&
          current.pendingRevoke === 0
        ) {
          onComplete?.()
          break
        }
      }
    } catch (err) {
      console.error(err)
      setError("Failed to publish contracts. Please try again.")
    } finally {
      processingRef.current = false
      setIsProcessing(false)
    }
  }

  const handleRetryMetadata = () => {
    setMetadataStatus("running")
    setMetadataError(null)
    setMetadataAttempt((attempt) => attempt + 1)
  }

  const handleRetryContracts = () => {
    if (isProcessing || metadataStatus !== "success") {
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
  const progressHelperText = remainingRevocations > 0
    ? `${remainingRevocations} outdated attestation${remainingRevocations === 1 ? "" : "s"} awaiting revocation`
    : totalRemaining > 0
      ? `${totalRemaining} contract${totalRemaining === 1 ? "" : "s"} remaining`
      : "All contracts are published onchain"

  const showProgress =
    metadataStatus === "success" &&
    totalContracts > 0 &&
    (publishedCount > 0 || remainingContracts > 0)

  const completed =
    metadataStatus === "success" &&
    (totalContracts === 0 ||
      (remainingContracts === 0 && remainingRevocations === 0))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-4">
          <DialogTitle className="flex flex-col items-center gap-4">
            <span className="text-base font-semibold text-center">
              Publishing verified contracts onchain
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 w-full text-center">
          {metadataStatus === "running" && (
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
            <>
              {showProgress && (
                <LinearProgress
                  current={publishedCount}
                  total={totalContracts}
                  label="Contracts published"
                  helperText={progressHelperText}
                  className="w-full max-w-xs sm:max-w-sm"
                />
              )}

              {!showProgress &&
                !error &&
                (remainingContracts > 0 || remainingRevocations > 0) && (
                  <p className="text-sm text-secondary-foreground">
                    Preparing to publish verified contracts…
                  </p>
                )}

              {error && (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-destructive-foreground">
                    {error}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleRetryContracts}
                  >
                    Retry contract publish
                  </Button>
                </div>
              )}

              {!completed && !error && (
                <div className="flex items-center gap-2 text-sm text-secondary-foreground">
                  <Loader2
                    size={18}
                    className={`animate-spin ${isProcessing ? "opacity-100" : "opacity-60"}`}
                  />
                </div>
              )}

              {completed && (
                <div className="text-sm font-medium text-success">
                  All contracts are now published!
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
