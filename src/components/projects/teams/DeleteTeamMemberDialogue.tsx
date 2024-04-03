"use client"
import { memo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IUser } from "./AddTeamDetailsForm"

interface IProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  handleButtonClick: () => void
  member: IUser | null
}

const DeleteTeamMemberDialogue: React.FC<IProps> = ({
  open,
  onOpenChange,
  handleButtonClick,
  member,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center sm:max-w-md">
        <div className="flex items-center justify-center mt-4">
          <Avatar className="!w-20 !h-20">
            <AvatarImage
              src={member?.profilePictureUrl}
              alt="avatar"
              className="w-full h-full rounded-full"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>

        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold text-text-default">
            Are you sure you want to remove {member?.fullName} from the team?
          </DialogTitle>
        </DialogHeader>
        <Button
          onClick={handleButtonClick}
          className="w-full"
          size="lg"
          type="button"
          variant="destructive"
        >
          Confirm
        </Button>
        <Button
          onClick={() => onOpenChange(false)}
          className="w-full"
          size="lg"
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default memo(DeleteTeamMemberDialogue)
