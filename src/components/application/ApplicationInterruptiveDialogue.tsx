"use client"

import Image from "next/image"
import Link from "next/link"
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
import { Badge } from "../ui/badge"

function ApplicationInterruptiveDialogue({
  open,
  onOpenChange,
}: DialogProps<object>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-4">
          <Badge
            variant="secondary"
            className="text-sm font-medium text-text-secondary"
          >
            Announcement
          </Badge>
          <Image
            src="/assets/images/applications-announcement.png"
            width={410}
            height={196}
            alt="application announcement"
          />
          <div className="flex flex-col gap-2">
            <DialogTitle className="text-center text-xl font-semibold text-text-default">
              Now taking applications for Retro Funding Round 5: OP Stack
            </DialogTitle>
            <DialogDescription className="text-center text-base font-normal text-text-secondary flex flex-col gap-6">
              If you plan on applying, please carefully review the application
              and eligibility requirements before you edit or add projects.
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="w-full sm:flex-col gap-2">
          <Link href="/application/5">
            <Button className="w-full" type="button" variant="destructive">
              Review the application
            </Button>
          </Link>
          <Link href="/projects/new">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full !ml-0"
              type="button"
              variant="outline"
            >
              Continue to project
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default memo(ApplicationInterruptiveDialogue)
