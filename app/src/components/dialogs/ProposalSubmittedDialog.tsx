"use client"

import { ExternalLink } from "lucide-react"
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

interface ProposalSubmittedDialogProps extends DialogProps<object> {
  transactionHash?: string
  onViewProposals?: () => void
  onViewTransaction?: () => void
  onClose?: () => void
}

function ProposalSubmittedDialog({
  open,
  onOpenChange,
  transactionHash,
  onViewProposals,
  onViewTransaction,
  onClose,
}: ProposalSubmittedDialogProps) {
  const handleClose = () => {
    if (onClose) {
      onClose()
    }
    onOpenChange(false)
  }

  const handleViewProposals = () => {
    if (onViewProposals) {
      onViewProposals()
    }
    handleClose()
  }

  const handleViewTransaction = () => {
    if (onViewTransaction) {
      onViewTransaction()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-4">
          <div className="flex justify-center">
            <Image
              src="/assets/images/optimism_hero.svg"
              alt="Optimism Hero"
              width={320}
              height={101}
              className="max-w-full h-auto"
            />
          </div>
          <div className="flex flex-col gap-2">
            <DialogTitle className="text-left text-2xl font-black text-text-default">
              Proposal complete!
            </DialogTitle>
            <DialogDescription className="text-left text-base font-normal text-text-secondary">
              It may take a few minutes for the proposal to be indexed and
              appear on Agora.
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="w-full sm:flex-col gap-2">
          <Button
            onClick={handleViewProposals}
            className="w-full"
            type="button"
            variant="default"
          >
            View Proposals
          </Button>

          {transactionHash && (
            <Button
              onClick={handleViewTransaction}
              className="w-full !ml-0 justify-between p-0 flex"
              type="button"
              variant="outline"
            >
              <span className="flex-1 text-left">View transaction on block explorer</span>
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default memo(ProposalSubmittedDialog)
