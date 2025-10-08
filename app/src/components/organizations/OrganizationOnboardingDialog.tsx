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

import { DialogProps } from "../dialogs/types"
import { Badge } from "../ui/badge"

interface OrganizationOnboardingDialogProps extends DialogProps<object> {
  onConfirm: () => void
}

function OrganizationOnboardingDialog({
  open,
  onOpenChange,
  onConfirm,
}: OrganizationOnboardingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-4">
          <Badge variant="secondary" className="text-text-secondary">
            New
          </Badge>
          <Image
            src="/assets/images/organization-create-graphic.png"
            width={410}
            height={196}
            alt="Organization create"
          />
          <div className="flex flex-col gap-2">
            <DialogTitle className="text-center text-lg font-normal text-text-default">
              Introducing Organizations
            </DialogTitle>
            <DialogDescription className="text-center text-base font-normal text-text-secondary flex flex-col gap-6">
              Make an organization to group your team’s projects in one place.
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="w-full sm:flex-col gap-2">
          <Button
            onClick={onConfirm}
            className="w-full"
            type="button"
            variant="destructive"
          >
            Make an organization
          </Button>
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

export default memo(OrganizationOnboardingDialog)
