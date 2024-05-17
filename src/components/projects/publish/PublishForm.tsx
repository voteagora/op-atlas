"use client"

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

import { Snapshot } from "./Snapshot"

export const PublishForm = ({ project }: { project: ProjectWithDetails }) => {
  const [isPublishing, setIsPublishing] = useState(false)

  const isReadyToPublish = useMemo(() => {
    const { completedSections } = getProjectStatus(project)
    return (
      intersection(
        [
          ProjectSection.Details,
          ProjectSection.Team,
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
      success: () => {
        setIsPublishing(false)
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
        <h2>Publish metadata onchain</h2>
        <p className="text-secondary-foreground">
          If you&apos;ve completed the previous steps, then it&apos;s time to
          record your project&apos;s metadata onchain. Hit publish and Optimism
          will issue an attestation containing all of your project&apos;s
          metadata.
        </p>
      </div>

      {project.snapshots.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Published</p>
          {sortBy((s) => -s.createdAt, project.snapshots).map((snapshot) => (
            <Snapshot key={snapshot.id} snapshot={snapshot} />
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-4">
        <Button
          isLoading={isPublishing}
          variant="destructive"
          disabled={!canPublish || isPublishing}
          onClick={onPublish}
          className="w-fit"
        >
          Publish
        </Button>

        {!isReadyToPublish && (
          <p className="text-sm text-destructive">
            You haven&apos;t completed all the previous steps
          </p>
        )}
        {hasUnpublishedChanges && (
          <p className="text-sm text-destructive">
            Your recent edits haven&apos;t been published onchain
          </p>
        )}
      </div>
    </div>
  )
}
