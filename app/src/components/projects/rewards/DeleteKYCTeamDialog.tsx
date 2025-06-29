import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { DialogProps } from "@/components/dialogs/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
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

  const { mutate: deleteProjectKYCTeam, isPending } = useMutation({
    mutationFn: async () => {
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
      onOpenChange(false)
      if (organizationId) {
        router.push(`/profile/organizations/${organizationId}/grant-address`)
      }
      if (projectId) {
        router.push(`/projects/${projectId}/grant-address`)
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-0.5 text-center items-center">
            <DialogTitle className="text-center text-xl font-semibold text-text-default">
              {hasActiveStream
                ? "Are you sure?"
                : "Are you sure you want to delete this wallet and start the verification process over?"}
            </DialogTitle>
            {hasActiveStream && (
              <DialogDescription className="text-center text-base font-normal text-text-secondary flex flex-col gap-6">
                If you stop this stream, your grant delivery address will be
                permanently invalidated and cannot be used again.
              </DialogDescription>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              disabled={isPending}
              type="button"
              variant="destructive"
              className="py-3"
              onClick={() => {
                deleteProjectKYCTeam()
              }}
            >
              {hasActiveStream
                ? "Stop stream and invalidate address"
                : "Yes, delete this wallet"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="py-3"
              onClick={() => onOpenChange(false)}
            >
              Go back
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
