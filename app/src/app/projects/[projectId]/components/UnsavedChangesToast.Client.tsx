"use client"

import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast, Toaster } from "sonner"

import MetadataPublishedConfirmationDialog from "@/components/projects/publish/MetadataPublishedConfirmationDialog"
import { createProjectSnapshot } from "@/lib/actions/snapshots"
import { ProjectWithDetails } from "@/lib/types"
import { projectHasUnpublishedChanges } from "@/lib/utils"
import { useAnalytics } from "@/providers/AnalyticsProvider"

const UnsavedChangesToastClient = ({
  project,
}: {
  project: ProjectWithDetails
}) => {
  const { track } = useAnalytics()
  const toastOpenRef = useRef(false)
  const [showMetadataPublishedDialogue, setShowMetadataPublishedDialogue] =
    useState(false)
  const hasUnpublishedChanges = projectHasUnpublishedChanges(project)
  const hasBeenPublished = project ? project?.snapshots.length > 0 : false

  const onPublish = useCallback(async () => {
    toast.promise(createProjectSnapshot(project.id), {
      loading: "Publishing metadata onchain...",
      success: ({ snapshot }) => {
        setShowMetadataPublishedDialogue(true)
        track("Publish Project", {
          projectId: project.id,
          attestationId: snapshot?.attestationId,
        })
        return "Snapshot published"
      },
      error: () => {
        return "Error publishing snapshot, please try again."
      },
    })
  }, [project.id, track])

  useEffect(() => {
    if (hasUnpublishedChanges && hasBeenPublished && !toastOpenRef.current) {
      toastOpenRef.current = true
      const toastId = toast.custom(
        () => {
          return (
            <div className="flex flex-row items-center bg-white relative p-6 rounded-md border border-gray-200">
              <Image
                onClick={() => toast.dismiss(toastId)}
                className="absolute top-2 right-2 w-2 h-2 cursor-pointer"
                alt="Checkmark"
                src="/assets/icons/crossIcon.svg"
                height={14}
                width={14}
              />
              <p className="text-sm">
                {`Your recent edits haven't been published onchain`}
              </p>
              <button
                className="bg-red-500 text-white font-medium rounded-md px-3 py-2 w-[100px] ml-2 text-sm"
                onClick={() => {
                  onPublish()
                  toast.dismiss(toastId)
                }}
              >
                Publish
              </button>
            </div>
          )
        },
        {
          duration: Infinity,
          onDismiss: () => {
            toastOpenRef.current = false
          },
        },
      )
    }
  }, [hasUnpublishedChanges, hasBeenPublished, onPublish, project])

  return (
    <>
      {showMetadataPublishedDialogue && (
        <MetadataPublishedConfirmationDialog
          open
          onOpenChange={setShowMetadataPublishedDialogue}
        />
      )}
      <Toaster />
    </>
  )
}

export default UnsavedChangesToastClient
