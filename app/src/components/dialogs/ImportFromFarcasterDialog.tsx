"use client"

import { useSession } from "next-auth/react"
import { memo } from "react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { usePrivyFarcaster } from "@/hooks/privy/usePrivyFarcaster"

import Image from "next/image"

import { DialogProps } from "./types"
import { Farcaster } from "@/components/icons/socials"


function ImportFromFarcasterDialog({ open, onOpenChange }: DialogProps<object>) {

    const { data: session } = useSession()
    const userId = session?.user?.id
    const { linkFarcaster } = usePrivyFarcaster(userId ?? "")

    const handleImport = async () => {
        if (!userId) return

        linkFarcaster()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex flex-col items-center sm:max-w-md">
                <DialogHeader className="flex flex-col items-center gap-4">
                    <div className="flex flex-row relative justify-center items-center">
                        <div className="w-[150px] h-[80px]">
                            <div className="w-[80px] h-[80px] absolute left-0 flex items-center justify-center rounded-full border border-dashed border-muted bg-none">
                                <Image
                                    className="text-foreground group-hover:opacity-0 transition-opacity"
                                    src="/assets/icons/user-icon.svg"
                                    alt="user"
                                    width={18}
                                    height={18}
                                />
                            </div>
                            <div className="w-[80px] h-[80px] rounded-full bg-[#855DCD] flex items-center justify-center absolute left-[70px]">
                                <Farcaster className="h-7 w-7" fill="#FFFFFF" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <DialogTitle className="text-center text-lg font-normal text-default">
                            Import your photo from Farcaster
                        </DialogTitle>
                        <DialogDescription className="text-center text-muted-foreground flex flex-col gap-6">
                            Import your photo as well as your name, username, and bio to display on your profile.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="flex flex-col gap-2 w-full mt-4">

                    <Button
                        onClick={handleImport}
                        className="w-full"
                        type="button"
                        variant="destructive"
                        disabled={!userId}
                    >
                        Import from Farcaster
                    </Button>

                    <Button
                        onClick={() => window.open('https://warpcast.com/~/signup', '_blank')}
                        className="w-full"
                        type="button"
                        variant="outline"
                    >
                        Create a Farcaster account
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default memo(ImportFromFarcasterDialog) 