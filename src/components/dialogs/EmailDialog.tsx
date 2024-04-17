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
import { Input } from "../ui/input"

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
          <DialogDescription className="text-center text-base font-normal text-text-secondary mt-1 flex flex-col gap-6">
            This step is required to apply for Retro Funding. It should be a
            personal email where we can reliably reach you. Don’t worry, we’ll
            keep it private.
            <div className="flex flex-col gap-2">
              <div className="font-500 self-start">Email</div>
              <Input type="email" placeholder="Enter email address" />
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="w-full">
          <Button
            onClick={() => onOpenChange(false)}
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
