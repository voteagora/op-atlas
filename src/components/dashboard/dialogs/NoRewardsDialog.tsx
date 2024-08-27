"use client"

import Image from "next/image"
import { memo } from "react"

import { DialogProps } from "@/components/dialogs/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function NoRewardsDialog({ open, onOpenChange }: DialogProps<object>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-4">
          <Image
            src="/assets/icons/sunny-red.svg"
            width={80}
            height={80}
            alt="Sunny face"
          />
          <div className="flex flex-col gap-2">
            <DialogTitle className="text-center text-lg font-semibold text-text-default">
              Your project did not receive rewards in Round 4
            </DialogTitle>
            <DialogDescription className="text-center text-base font-normal text-text-secondary flex flex-col gap-6">
              Thank you for submitting an application, and we hope you&apos;ll
              try again in future rounds of Retro Funding.
            </DialogDescription>
          </div>
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

export default memo(NoRewardsDialog)
