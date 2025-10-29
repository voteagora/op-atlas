"use client"

import Link from "next/link"
import { intersection, sortBy } from "ramda"
import { useCallback, useEffect, useMemo, useState } from "react"

import { LinearProgress } from "@/components/common/LinearProgress"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Snapshot } from "@/components/projects/publish/Snapshot"
import { ProjectContracts, ProjectWithFullDetails } from "@/lib/types"
import {
  getProjectStatus,
  projectHasUnpublishedChanges,
  ProjectSection,
} from "@/lib/utils"
import { useAnalytics } from "@/providers/AnalyticsProvider"

import MetadataPublishedConfirmationDialog from "./MetadataPublishedConfirmationDialog"
import {
  PublishContractsDialog,
  type PublishProgress,
} from "./PublishContractsDialog"

export const PublishForm = ({
  project,
  contracts,
}: {
  project: ProjectWithFullDetails
  contracts: ProjectContracts | null
}) => {
  const [showMetadataPublishedDialogue, setShowMetadataPublishedDialogue] =
    useState(false)
  const [showPublishContractsDialog, setShowPublishContractsDialog] =
    useState(false)
  const [publishProgress, setPublishProgress] =
    useState<PublishProgress | null>(null)
  const [latestMetadataAttestationId, setLatestMetadataAttestationId] =
    useState<string | undefined>(undefined)
  const [isProgressLoading, setIsProgressLoading] = useState(true)
  const [hasMetadataSnapshot, setHasMetadataSnapshot] = useState(
    project.snapshots.length > 0,
  )

  const { track } = useAnalytics()

  const fetchPublishProgress = useCallback(async () => {
    setIsProgressLoading(true)
    try {
      const response = await fetch(
        `/api/projects/${project.id}/contracts/publish-progress`,
        { cache: "no-store" },
      )

      if (!response.ok) {
        return
      }

      const data = (await response.json()) as PublishProgress
      setPublishProgress(data)
    } catch (error) {
      console.error("Failed to load publish progress", error)
    } finally {
      setIsProgressLoading(false)
    }
  }, [project.id])

  useEffect(() => {
    fetchPublishProgress()
  }, [fetchPublishProgress])

  const isReadyToPublish = useMemo(() => {
    const { completedSections } = getProjectStatus(project, contracts)
    return (
      intersection(
        [
          ProjectSection.Details,
          ProjectSection.Contributors,
          ProjectSection.Repos,
          ProjectSection.Contracts,
          ProjectSection.Grants,
        ],
        completedSections,
      ).length === 5
    )
  }, [project, contracts])

  const hasPublishedLatestChanges = useMemo(() => {
    const sortedSnapshots = project.snapshots.slice().sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    if (!sortedSnapshots[0]) return false

    return sortedSnapshots[0].createdAt >= project.lastMetadataUpdate
  }, [project])

  const hasUnpublishedChanges = useMemo(() => {
    return projectHasUnpublishedChanges(
      project.snapshots,
      project.lastMetadataUpdate,
    )
  }, [project])

  const handleProgressUpdate = useCallback(
    (progress: PublishProgress) => {
      setPublishProgress(progress)
    },
    [],
  )

  const handlePublishComplete = useCallback(() => {
    setShowPublishContractsDialog(false)
    fetchPublishProgress()
    if (latestMetadataAttestationId) {
      setShowMetadataPublishedDialogue(true)
    }
  }, [fetchPublishProgress, latestMetadataAttestationId])

  const handleMetadataPublished = useCallback(
    (attestationId?: string) => {
      setHasMetadataSnapshot(true)
      setLatestMetadataAttestationId(attestationId)
      track("Publish Project", {
        projectId: project.id,
        attestationId,
        elementType: "Button",
        elementName: "Publish",
      })
    },
    [project.id, track],
  )

  const outstandingContracts = useMemo(() => {
    if (!publishProgress) return 0
    return (
      (publishProgress.pendingPublish ?? 0) +
      (publishProgress.pendingRevoke ?? 0)
    )
  }, [publishProgress])

  const showResumeButton = useMemo(() => {
    if (!publishProgress) return false
    const hasOutstanding = outstandingContracts > 0
    return hasMetadataSnapshot && hasOutstanding
  }, [publishProgress, outstandingContracts, hasMetadataSnapshot])

  const onPublish = () => {
    setShowMetadataPublishedDialogue(false)
    setLatestMetadataAttestationId(undefined)
    setShowPublishContractsDialog(true)
  }

  const canPublish = isReadyToPublish && !hasPublishedLatestChanges
  const shouldShowResumeButton = !isProgressLoading && showResumeButton
  const shouldShowPublishButton = !isProgressLoading && !shouldShowResumeButton
  const totalContracts = publishProgress?.verifiedTotal ?? 0
  const publishedContracts = publishProgress?.publishedTotal ?? 0
  const remainingContracts =
    (publishProgress?.pendingPublish ?? 0) +
    (publishProgress?.pendingRevoke ?? 0)
  const progressHelperText =
    remainingContracts > 0
      ? `${remainingContracts} contract${remainingContracts === 1 ? "" : "s"} remaining`
      : publishedContracts > 0
        ? "All contracts are published onchain"
        : undefined

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <h2 className="text-text-default">Publish metadata onchain</h2>
          <p className="text-text-secondary">
            Publishing creates an attestation for your project metadata and one
            for each verified contract. Once these attestations are onchain,
            you&apos;ll be eligible to apply for Retro Funding.
          </p>
        </div>

        {project.snapshots.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm  font-normal text-foreground">Published</p>
            {project.snapshots
              .slice()
              .sort((a, b) => {
                return (
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
                )
              })
              .map((snapshot) => {
                return <Snapshot key={snapshot.id} snapshot={snapshot} />
              })}
          </div>
        ) : null}

        {!isProgressLoading && totalContracts > 0 && (
          <LinearProgress
            current={publishedContracts}
            total={totalContracts}
            label="Contracts published"
            helperText={progressHelperText}
          />
        )}

        <div className="flex flex-wrap items-center gap-4">
          {isProgressLoading ? (
            <Skeleton className="h-9 w-40 rounded-md" />
          ) : shouldShowResumeButton ? (
            <Button
              variant="destructive"
              className="w-fit text-sm font-normal"
              onClick={() => setShowPublishContractsDialog(true)}
            >
              Continue publishing contracts
            </Button>
          ) : (
            shouldShowPublishButton && (
              <Button
                variant="destructive"
                disabled={!canPublish || showPublishContractsDialog}
                onClick={onPublish}
                className="w-fit text-sm font-normal"
              >
                Publish
              </Button>
            )
          )}

          {!isReadyToPublish && (
            <p className="text-sm text-destructive-foreground">
              You haven&apos;t completed all the previous steps
            </p>
          )}
          {isReadyToPublish && hasUnpublishedChanges && (
            <p className="text-sm text-destructive-foreground">
              Your recent edits haven&apos;t been published onchain
            </p>
          )}
        </div>

        <hr className="mt-6" />
        <p className="text-base font-normal text-text-secondary ">
          <span className="text-base font-normal">You’re not done yet!</span>{" "}
          To be included in any round of Retro Funding, you must also submit a
          round-specific application.{" "}
        </p>
        <Button
          variant="secondary"
          className="w-fit text-sm font-normal text-foreground"
        >
          <Link href="/missions">View Retro Funding Rounds</Link>
        </Button>
      </div>
      {showMetadataPublishedDialogue && (
        <MetadataPublishedConfirmationDialog
          open
          onOpenChange={setShowMetadataPublishedDialogue}
        />
      )}
      <PublishContractsDialog
        projectId={project.id}
        open={showPublishContractsDialog}
        onOpenChange={(next) => {
          setShowPublishContractsDialog(next)
          if (!next) {
            fetchPublishProgress()
          }
        }}
        onProgressUpdate={handleProgressUpdate}
        onComplete={handlePublishComplete}
        onMetadataPublished={handleMetadataPublished}
      />
    </div>
  )
}
