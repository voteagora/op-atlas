"use client"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
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

function IneligibleDialog({ open, onOpenChange }: DialogProps<object>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-4">
          <div className="flex justify-center item-center h-20 w-20 rounded-full bg-secondary">
            <Image
              src="/assets/icons/info-black.svg"
              width={27}
              height={27}
              alt="Information"
            />
          </div>
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-center text-lg font-semibold text-text-default">
              Your project is missing data required for this round of Retro
              Funding
            </DialogTitle>
            <DialogDescription className="text-center text-base font-normal text-text-secondary mt-1 flex flex-col gap-6">
              Review your project setup and enter the required fields, then
              return to this application.
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="w-full">
          <div className="flex flex-col gap-2 w-full">
            <Link className="w-full" href="/dashboard">
              <Button
                variant="destructive"
                className="w-full py-3 text-base font-normal h-[unset]"
                type="button"
              >
                View projects
              </Button>
            </Link>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full text-base font-normal py-3  h-[unset]"
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default memo(IneligibleDialog)
