"use client"

import Link from "next/link"
import { intersection, sortBy } from "ramda"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { createProjectSnapshot } from "@/lib/actions/snapshots"
import { ProjectWithDetails } from "@/lib/types"
import {
  getProjectStatus,
  projectHasUnpublishedChanges,
  ProjectSection,
} from "@/lib/utils"
import { useAnalytics } from "@/providers/AnalyticsProvider"

import MetadataPublishedConfirmationDialog from "./MetadataPublishedConfirmationDialog"
import { Snapshot } from "./Snapshot"

export const PublishForm = ({ project }: { project: ProjectWithDetails }) => {
  const [isPublishing, setIsPublishing] = useState(false)
  const [showMetadataPublishedDialogue, setShowMetadataPublishedDialogue] =
    useState(false)

  const { track } = useAnalytics()

  const isReadyToPublish = useMemo(() => {
    const { completedSections } = getProjectStatus(project)
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
  }, [project])

  const hasPublishedLatestChanges = useMemo(() => {
    const latestSnapshot = sortBy((s) => -s.createdAt, project.snapshots)[0]
    if (!latestSnapshot) return false

    return latestSnapshot.createdAt >= project.lastMetadataUpdate
  }, [project])

  const hasUnpublishedChanges = useMemo(() => {
    return projectHasUnpublishedChanges(project)
  }, [project])

  const onPublish = async () => {
    setIsPublishing(true)

    toast.promise(createProjectSnapshot(project.id), {
      loading: "Publishing snapshot onchain...",
      success: ({ snapshot }) => {
        setIsPublishing(false)
        setShowMetadataPublishedDialogue(true)
        track("Publish Project", {
          projectId: project.id,
          attestationId: snapshot?.attestationId,
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
            <p className="text-sm  font-medium text-foreground">Published</p>
            {sortBy((s) => -s.createdAt, project.snapshots).map((snapshot) => (
              <Snapshot key={snapshot.id} snapshot={snapshot} />
            ))}

            {/* Only show this when applications are open */}
            {/* {project.snapshots.length > 0 ? (
            <Callout
              type="info"
              text="You can apply for Retro Funding Round 4"
              linkHref="/application"
              linkText="Apply"
            />
          ) : null} */}
          </div>
        ) : null}

        <div className="flex items-center gap-4">
          <Button
            isLoading={isPublishing}
            variant="destructive"
            disabled={!canPublish || isPublishing}
            onClick={onPublish}
            className="w-fit text-sm font-medium"
          >
            Publish
          </Button>

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
          <span className="text-base font-semibold">You’re not done yet!</span>{" "}
          To be included in any round of Retro Funding, you must also submit a
          round-specific application.{" "}
        </p>
        <Button
          variant="secondary"
          className="w-fit text-sm font-medium text-foreground"
        >
          <Link href="/rounds">View rounds</Link>
        </Button>
      </div>
      {showMetadataPublishedDialogue && (
        <MetadataPublishedConfirmationDialog
          open
          onOpenChange={setShowMetadataPublishedDialogue}
        />
      )}
    </div>
  )
}
