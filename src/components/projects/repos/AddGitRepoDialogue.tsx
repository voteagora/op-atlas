"use client"
import { memo, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface IProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const GitRepoDialogue: React.FC<IProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold text-text-default">
            First, let’s find your repo
          </DialogTitle>
          <DialogDescription className="text-center text-base font-normal text-text-secondary mt-1">
            Your project repo must be public.
          </DialogDescription>
        </DialogHeader>
        <Input
          type="text"
          placeholder="https://github.com/puky-cats-dapp/main"
        />
        <Button
          className="w-full flex justify-start gap-x-1 disabled:opacity-1"
          variant="secondary"
        >
          <Image
            src="/assets/icons/githubIcon.svg"
            alt="img"
            width={20}
            height={19}
          />
          searching...
        </Button>
        <Button className="w-full disabled:opacity-1" variant="destructive">
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default memo(GitRepoDialogue)
