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
            <DialogTitle className="text-center text-xl font-semibold text-text-default">
              Now that your metadata is published onchain, you can use this
              project to apply for Retro Funding
            </DialogTitle>
            <DialogDescription className="text-center text-base font-normal text-text-secondary flex flex-col gap-6">
              Adding a project is the first step. To receive Retro Funding, you
              must also submit an application with each round.
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="w-full sm:flex-col gap-2">
          {APPLICATIONS_CLOSED ? (
            <Link href="/rounds">
              <Button className="w-full" type="button" variant="destructive">
                View rounds
              </Button>
            </Link>
          ) : (
            <Link
              href="/application/5"
              className={cn(
                "flex items-center rounded-xl p-6 w-full",
                "bg-accent text-accent-foreground",
              )}
            >
              <Image
                alt="Info"
                src="/assets/icons/sunny-callout.png"
                width={48}
                height={48}
              />
              <div className="ml-4 mr-5 flex-1">
                <p className="text-base font-semibold">Round 5: OP Stack</p>
                <div className="text-base font-normal">Apply by Sep 5</div>
              </div>
              <ArrowRight size={20} />
            </Link>
          )}

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
