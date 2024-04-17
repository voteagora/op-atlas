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

interface IProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const EmailDialog: React.FC<IProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold text-text-default">
            Please add email for important messages
          </DialogTitle>
          <DialogDescription className="text-center text-base font-normal text-text-secondary mt-1">
            This step is required to apply for Retro Funding. It should be a
            personal email where we can reliably reach you. Don’t worry, we’ll
            keep it private.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="w-full">
          <Button
            onClick={() => console.log("print email")}
            className="w-full"
            type="button"
            variant="destructive"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default memo(EmailDialog)
