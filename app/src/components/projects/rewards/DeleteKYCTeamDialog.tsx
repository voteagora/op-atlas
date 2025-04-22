import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { DialogProps } from "@/components/dialogs/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { deleteOrganizationKYCTeam } from "@/lib/actions/organizations"
import { deleteProjectKYCTeamAction } from "@/lib/actions/projects"
import { useAppDialogs } from "@/providers/DialogProvider"

export function DeleteKYCTeamDialog({
  open,
  onOpenChange,
}: DialogProps<object>) {
  const {
    data: { projectId, organizationId, kycTeamId },
  } = useAppDialogs()

  const queryClient = useQueryClient()

  const { mutate: deleteProjectKYCTeam, isPending } = useMutation({
    mutationFn: async () => {
      if (!organizationId) {
        await deleteProjectKYCTeamAction({
          kycTeamId: kycTeamId ?? "",
          projectId: projectId ?? "",
        })
        await queryClient.invalidateQueries({
          queryKey: ["kyc-teams", "project", projectId],
        })
      } else {
        await deleteOrganizationKYCTeam({
          organizationId: organizationId ?? "",
          kycTeamId: kycTeamId ?? "",
        })
        await queryClient.invalidateQueries({
          queryKey: ["kyc-teams", "organization", organizationId],
        })
      }
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-0.5 text-center items-center">
            <h3>
              Are you sure you want to delete this wallet and start the
              verification process over?
            </h3>
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
              Yes, delete this wallet
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
