import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { DialogProps } from "@/components/dialogs/types"
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog"
import { deleteKYCTeamAction } from "@/lib/actions/kyc"
import { useAppDialogs } from "@/providers/DialogProvider"

export function DeleteKYCTeamDialog({
  open,
  onOpenChange,
}: DialogProps<object>) {
  const {
    data: { projectId, organizationId, kycTeamId, hasActiveStream },
  } = useAppDialogs()

  const router = useRouter()
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    await deleteKYCTeamAction({
      kycTeamId: kycTeamId ?? "",
      projectId: projectId ?? "",
      organizationId: organizationId ?? "",
      hasActiveStream: !!hasActiveStream,
    })
    
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["kyc-teams", "project", projectId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["kyc-teams", "organization", organizationId],
      }),
    ])
    
    if (organizationId) {
      router.push(`/profile/organizations/${organizationId}/grant-address`)
    }
    if (projectId) {
      router.push(`/projects/${projectId}/grant-address`)
    }
  }

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleDelete}
      title={
        hasActiveStream
          ? "Are you sure?"
          : "Are you sure you want to remove this address and start the verification process over?"
      }
      description={
        hasActiveStream
          ? "If you stop this stream, your grant delivery address will be permanently invalidated and cannot be used again."
          : undefined
      }
      confirmText={
        hasActiveStream
          ? "Stop stream and invalidate address"
          : "Remove and start over"
      }
      cancelText="Go back"
      variant="destructive"
    />
  )
}
