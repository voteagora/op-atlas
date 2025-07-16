"use client"

import { toast } from "sonner"

import { ArrowRightUp } from "@/components/icons/remix"
import { Button } from "@/components/ui/button"
import { copyToClipboard } from "@/lib/utils"

interface Props {
  forumText: string
  forumLink?: string
}

export function CopyForumTextButton({ forumText, forumLink }: Props) {
  const handleCopyAndGo = async () => {
    await copyToClipboard(forumText)
    toast.success("Forum text copied to clipboard!")
    if (forumLink) {
      window.open(forumLink, "_blank")
    }
  }

  return (
    <Button className="w-fit button-primary" onClick={handleCopyAndGo}>
      Copy and go <ArrowRightUp fill="#fff" className="w-4 h-4 ml-2" />
    </Button>
  )
}
