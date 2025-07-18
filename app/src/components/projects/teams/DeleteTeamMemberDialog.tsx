"use client"

import { User } from "@prisma/client"
import { useState } from "react"
import { toast } from "sonner"

import { UserAvatar } from "@/components/common/UserAvatar"
import { DialogProps } from "@/components/dialogs/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useUser } from "@/hooks/db/useUser"
import { useUsername } from "@/hooks/useUsername"

const DeleteTeamMemberDialog = ({
  open,
  onOpenChange,
  onRemove,
  member,
}: DialogProps<{ member: User | null; onRemove: () => Promise<void> }>) => {
  const [loading, setLoading] = useState(false)

  const { user } = useUser({ id: member?.id })
  const username = useUsername(user)

  console.log(user)

  const onClick = async () => {
    try {
      setLoading(true)
      await onRemove()
    } catch (error) {
      toast.error("Error removing team member")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        <DialogTitle>Remove team member</DialogTitle>
        <div className="flex flex-col items-center gap-y-4">
          <UserAvatar imageUrl={member?.imageUrl} />

          <h3 className="text-center px-6">
            Are you sure you want to remove {username} from the team?
          </h3>
        </div>

        <div className="flex flex-col w-full gap-y-2">
          <Button
            disabled={loading}
            onClick={onClick}
            className="focus-visible:ring-0"
            size="lg"
            type="button"
            variant="destructive"
          >
            Confirm
          </Button>
          <Button
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className="focus-visible:ring-0"
            size="lg"
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteTeamMemberDialog
