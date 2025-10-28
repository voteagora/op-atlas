"use client"

import Link from "next/link"
import { intersection, sortBy } from "ramda"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { Snapshot } from "@/components/projects/publish/Snapshot"
import { Button } from "@/components/ui/button"
import { createProjectSnapshot } from "@/lib/actions/snapshots"
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
  const [isPublishing, setIsPublishing] = useState(false)
  const [showMetadataPublishedDialogue, setShowMetadataPublishedDialogue] =
    useState(false)
  const [showPublishContractsDialog, setShowPublishContractsDialog] =
    useState(false)
  const [publishProgress, setPublishProgress] =
    useState<PublishProgress | null>(null)

  const { track } = useAnalytics()

  const fetchPublishProgress = useCallback(async () => {
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
  }, [fetchPublishProgress])

  const outstandingContracts = useMemo(() => {
    if (!publishProgress) return 0
    return (
      (publishProgress.pendingPublish ?? 0) +
      (publishProgress.pendingRevoke ?? 0)
    )
  }, [publishProgress])

  const showResumeButton = useMemo(() => {
    if (!publishProgress) return false
    const someContractsPublished =
      (publishProgress.publishedTotal ?? 0) > 0
    const snapshotExists = project.snapshots.length > 0
    const hasOutstanding = outstandingContracts > 0
    return snapshotExists && someContractsPublished && hasOutstanding
  }, [publishProgress, outstandingContracts, project.snapshots.length])

  const onPublish = async () => {
    setIsPublishing(true)

    toast.promise(createProjectSnapshot(project.id), {
      loading: "Publishing metadata onchain...",
      success: ({ snapshot, pendingContracts }) => {
        setIsPublishing(false)
        setShowMetadataPublishedDialogue(true)
        if (
          (pendingContracts?.toPublish ?? 0) > 0 ||
          (pendingContracts?.toRevoke ?? 0) > 0
        ) {
          setShowPublishContractsDialog(true)
        }
        fetchPublishProgress()
        track("Publish Project", {
          projectId: project.id,
          attestationId: snapshot?.attestationId,
          elementType: "Button",
          elementName: "Publish",
        })
        return "Snapshot published"
      },
      error: () => {
        setIsPublishing(false)
        return "Error publishing snapshot, please try again."
      },
    })
  }

  const canPublish = isReadyToPublish && !hasPublishedLatestChanges

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <h2 className="text-text-default">Publish metadata onchain</h2>
          <p className="text-text-secondary">
            If you’ve completed the previous steps, then hit publish and
            Optimism will issue an attestation containing your project’s
            metadata. Following this step, you’ll be eligible to apply for Retro
            Funding.
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

        <div className="flex items-center gap-4">
          <Button
            isLoading={isPublishing}
            variant="destructive"
            disabled={!canPublish || isPublishing}
            onClick={onPublish}
            className="w-fit text-sm font-normal"
          >
            Publish
          </Button>

          {showResumeButton && (
            <Button
              variant="secondary"
              className="w-fit text-sm font-normal"
              onClick={() => setShowPublishContractsDialog(true)}
            >
              Continue publishing contracts
            </Button>
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
      />
    </div>
  )
}
