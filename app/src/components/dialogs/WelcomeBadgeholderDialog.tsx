"use client"

import Image from "next/image"
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

import { DialogProps } from "./types"

function WelcomeBadgeholderDialog({ open, onOpenChange }: DialogProps<object>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-4">
          <Image
            src="/assets/icons/badgeholder-sunny.png"
            width={64}
            height={64}
            alt="Badgeholder checkmark"
          />
          <div className="flex flex-col gap-2">
            <DialogTitle className="text-center text-lg font-semibold text-text-default">
              Welcome badgeholder!
            </DialogTitle>
            <DialogDescription className="text-center text-base font-normal text-text-secondary flex flex-col gap-6">
              We appreciate your continued commitment to the Optimism
              Collective.
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

export default memo(WelcomeBadgeholderDialog)
