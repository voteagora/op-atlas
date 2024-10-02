import { useEffect } from "react"
import { toast } from "sonner"

import { createProjectSnapshot } from "@/lib/actions/snapshots"
import { projectHasUnpublishedChanges } from "@/lib/utils"

const useUnsavedProjectToast = ({ project }: { project: any }) => {
  const hasUnpublishedChanges = projectHasUnpublishedChanges(project)

  const onPublish = async () => {
    toast.promise(createProjectSnapshot(project.id), {
      loading: "Publishing metadata onchain...",
      success: ({ snapshot }) => {
        // setShowMetadataPublishedDialogue(true)
        return "Snapshot published"
      },
      error: () => {
        return "Error publishing snapshot, please try again."
      },
    })
  }

  useEffect(() => {
    if (hasUnpublishedChanges) {
      const toastId = toast(
        "Your recent edits haven't been published onchain",
        {
          action: (
            <button
              className="bg-red-500 text-white font-medium rounded-md px-3 py-2 w-[90px] ml-2"
              onClick={() => {
                onPublish()
                toast.dismiss(toastId)
              }}
            >
              Publish
            </button>
          ),
          duration: Infinity,
        },
      )
    }
  }, [hasUnpublishedChanges, project])
}

export default useUnsavedProjectToast
