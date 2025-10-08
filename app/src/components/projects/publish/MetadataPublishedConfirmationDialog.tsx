"use client"

import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
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
import { APPLICATIONS_CLOSED, cn } from "@/lib/utils"

function MetadataPublishedConfirmationDialog({
  open,
  onOpenChange,
}: DialogProps<object>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-4">
          <Image
            src="/assets/images/big-sunny.png"
            width={76.79}
            height={76.79}
            alt="application announcement"
          />
          <div className="flex flex-col gap-2">
            <DialogTitle className="text-center text-xl font-normal text-text-default">
              Now that your metadata is published onchain, you can use this
              project to apply for Retro Funding
            </DialogTitle>
            <DialogDescription className="text-center text-base font-normal text-text-secondary flex flex-col gap-6">
              Adding a project is the first step. To receive Retro Funding, you
              must also submit an application with each mission.
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="w-full sm:flex-col gap-2">
          <Link href="/missions">
            <Button className="w-full" type="button" variant="destructive">
              View Retro Funding Missions
            </Button>
          </Link>

          <Button
            onClick={() => onOpenChange(false)}
            className="w-full !ml-0"
            type="button"
            variant="outline"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default memo(MetadataPublishedConfirmationDialog)
