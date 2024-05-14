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

import { DialogProps } from "../dialogs/types"

function JoinProjectDialog({ open, onOpenChange }: DialogProps<object>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center sm:max-w-md">
        <DialogHeader className="flex flex-col items-center">
          <DialogTitle className="text-center text-lg font-semibold text-text-default">
            We&apos;re still working on this
          </DialogTitle>
          <DialogDescription className="text-center text-base font-normal text-text-secondary mt-1 flex flex-col gap-6">
            To join a project, please have your project’s admin add you as a
            team member.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="w-full">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full"
            type="button"
            variant="destructive"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default memo(JoinProjectDialog)
