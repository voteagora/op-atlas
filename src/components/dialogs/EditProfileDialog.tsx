"use client"
import { memo } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppDialogs } from "@/providers/DialogProvider"
import { DialogProps } from "./types"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

function EditProfileDialog({ open, onOpenChange }: DialogProps<object>) {
  const { setOpenDialog } = useAppDialogs()
  const { data: session } = useSession()

  const onClickEditEmail = () => {
    setOpenDialog("email")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-4">
          <Avatar className="!w-20 !h-20">
            <AvatarImage src={session?.user?.image || ""} alt="avatar" />
            <AvatarFallback>{session?.user?.name}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-center text-lg font-semibold text-text-default">
              Edit your profile
            </DialogTitle>
            <DialogDescription className="text-center text-base font-normal text-text-secondary mt-1 flex flex-col gap-6">
              Most of your profile information comes from Farcaster, so to edit
              your details please visit Warpcast. To edit your email, click
              below.
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="w-full">
          <div className="flex flex-col gap-2 w-full">
            <Button
              variant="destructive"
              className="w-full py-3 text-base font-normal h-[unset]"
              type="button"
            >
              <Link
                className="w-full"
                href="https://warpcast.com/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Visit Warpcast
              </Link>
            </Button>
            <Button
              onClick={onClickEditEmail}
              className="w-full text-base font-normal py-3  h-[unset]"
              type="button"
              variant="outline"
            >
              Edit email
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default memo(EditProfileDialog)
