"use client"

import { intersection } from "ramda"
import { useCallback, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { createProjectSnapshot } from "@/lib/actions/snapshots"
import { ProjectWithDetails } from "@/lib/types"
import { getProjectStatus, ProjectSection } from "@/lib/utils"

import { Snapshot } from "./Snapshot"

export const PublishForm = ({ project }: { project: ProjectWithDetails }) => {
  const [isPublishing, setIsPublishing] = useState(false)

  const canPublish = useMemo(() => {
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

  const onPublish = useCallback(async () => {
    try {
      setIsPublishing(true)
      await createProjectSnapshot(project.id)
    } catch (error) {
      console.error("Error publishing snapshot", error)
    } finally {
      setIsPublishing(false)
    }
  }, [project])

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
          {project.snapshots.map((snapshot) => (
            <Snapshot key={snapshot.id} snapshot={snapshot} />
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-4">
        <Button
          variant="destructive"
          disabled={!canPublish || isPublishing}
          onClick={onPublish}
          className="w-fit"
        >
          Publish
        </Button>

        {!canPublish && (
          <p className="text-sm text-destructive">
            You haven&apos;t completed all the previous steps
          </p>
        )}
      </div>
    </div>
  )
}