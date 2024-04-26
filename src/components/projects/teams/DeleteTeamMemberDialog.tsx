"use client"

import { memo, useState } from "react"
import { User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DialogProps } from "@/components/dialogs/types"

const DeleteTeamMemberDialog = ({
  open,
  onOpenChange,
  onRemove,
  member,
}: DialogProps<{ member: User | null; onRemove: () => Promise<void> }>) => {
  const [loading, setLoading] = useState(false)

  const onClick = async () => {
    try {
      setLoading(true)
      await onRemove()
    } catch (error) {
      // TODO: Toast
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        <div className="flex flex-col items-center gap-y-4">
          <div className="flex items-center justify-center h-20 w-20">
            <Avatar className="h-full w-full">
              <AvatarImage src={member?.imageUrl ?? undefined} alt="avatar" />
              <AvatarFallback>{member?.name?.[0]}</AvatarFallback>
            </Avatar>
          </div>

          <h3 className="text-center px-6">
            Are you sure you want to remove {member?.name} from the team?
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

export default memo(DeleteTeamMemberDialog)
