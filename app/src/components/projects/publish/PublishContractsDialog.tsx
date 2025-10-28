"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

import { Badge } from "@/components/common/Badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { publishProjectContractsBatch } from "@/lib/actions/snapshots"

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
}: PublishContractsDialogProps) {
  const [progress, setProgress] =
    useState<PublishProgress>(DEFAULT_PROGRESS)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
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
      setIsProcessing(false)
      processingRef.current = false
      return
    }

    setError(null)
    ;(async () => {
      const snapshot = await loadProgress()
      const hasWork =
        snapshot.pendingPublish > 0 || snapshot.pendingRevoke > 0
      if (hasWork) {
        await processBatches(snapshot)
      } else {
        onComplete?.()
      }
    })()

    return () => {
      abortRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectId])

  const processBatches = async (initialState?: PublishProgress) => {
    if (processingRef.current || abortRef.current) return
    processingRef.current = true
    setIsProcessing(true)

    try {
      let current = initialState ?? progress
      while (!abortRef.current) {
        const hasPending =
          current.pendingPublish > 0 || current.pendingRevoke > 0
        if (!hasPending) {
          onComplete?.()
          break
        }

        const result = await publishProjectContractsBatch({
          projectId,
          batchSize: 500,
        })

        if (result.error) {
          setError(
            typeof result.error === "string"
              ? result.error
              : "Failed to publish contracts. Please try again.",
          )
          break
        }

        current = {
          verifiedTotal: result.totalVerified,
          publishedTotal: result.totalPublished,
          pendingPublish: result.remainingPublish,
          pendingRevoke: result.remainingRevoke,
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

  const publishedCount = progress.publishedTotal
  const totalContracts = progress.verifiedTotal
  const remainingContracts = progress.pendingPublish
  const remainingRevocations = progress.pendingRevoke

  const showProgress =
    totalContracts > 0 &&
    (publishedCount > 0 || remainingContracts > 0)

  const completed =
    totalContracts > 0 &&
    remainingContracts === 0 &&
    remainingRevocations === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-4">
          <DialogTitle className="flex flex-col items-center gap-4">
            <Badge text="Publish contracts" />
            <span className="text-base font-semibold text-center">
              Publishing verified contracts onchain
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 w-full text-center">
          {showProgress && (
            <div className="flex flex-col gap-2 text-sm text-secondary-foreground">
              <div>
                {publishedCount} / {totalContracts} contracts published
              </div>
              {remainingContracts > 0 && (
                <div>{remainingContracts} contracts left to publish</div>
              )}
              {remainingRevocations > 0 && (
                <div>
                  {remainingRevocations} outdated attestations awaiting
                  revocation
                </div>
              )}
            </div>
          )}
          {!showProgress && !error && (
            <p className="text-sm text-secondary-foreground">
              Preparing to publish verified contracts…
            </p>
          )}
          {error && (
            <p className="text-sm text-destructive-foreground">{error}</p>
          )}
          {!completed && (
            <div className="flex items-center gap-2 text-sm text-secondary-foreground">
              <Loader2
                size={18}
                className={`animate-spin ${isProcessing ? "opacity-100" : "opacity-60"}`}
              />
              <span>
                {completed
                  ? "All contracts published!"
                  : "Publishing in batches…"}
              </span>
            </div>
          )}
          {completed && (
            <div className="text-sm font-medium text-success">
              All contracts are now published!
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
