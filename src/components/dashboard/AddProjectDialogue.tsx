"use client"
import { memo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface IProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  handleButtonClick: () => void
}

const AddProjectDialogue: React.FC<IProps> = ({
  open,
  onOpenChange,
  handleButtonClick,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center sm:max-w-md">
        <div className="px-2 py-0.5 text-sm text-text-secondary font-medium rounded-full bg-secondary">
          Eyebrow
        </div>
        <Avatar className="!w-20 !h-20">
          <AvatarImage src="/assets/images/avatar.png" alt="avatar" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold text-text-default">
            This modal to set expectations... onchain builders
          </DialogTitle>
          <DialogDescription className="text-center text-base font-normal text-text-secondary mt-1">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="w-full">
          <Button
            onClick={handleButtonClick}
            className="w-full"
            size="lg"
            type="button"
            variant="destructive"
          >
            Button
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default memo(AddProjectDialogue)
