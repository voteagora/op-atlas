"use client"

import { syncPrivyUser } from "@/db/privy";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { useLinkAccount, usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "../common/Button";

export const FarcasterConnection = ({ userId, children }: { userId: string; children: React.ReactNode }) => {

    const { unlinkFarcaster } = usePrivy()
    const { user, invalidate: invalidateUser } = useUser({ id: userId, enabled: true })
    const { user: privyUser } = usePrivy()

    const isIntermediateState = Number(user?.farcasterId || 0) !== privyUser?.farcaster?.fid;
    const username = user?.farcasterId ? user.username : privyUser?.farcaster?.username;

    const { linkFarcaster } = useLinkAccount({
        onSuccess: async ({ user: updatedPrivyUser, linkMethod }) => {
            if (linkMethod === "farcaster") {
                toast.promise(syncPrivyUser(updatedPrivyUser)
                    .then(() => invalidateUser()),
                    {
                        loading: "Linking farcaster...",
                        success: "Farcaster linked successfully",
                        error: "Failed to link farcaster",
                    })
            }
        },
    })

    const handleUnlinkFarcaster = () => {
        if (user?.farcasterId) {
            toast.promise(unlinkFarcaster(Number(user.farcasterId)), {
                loading: "Unlinking farcaster...",
                success: (updatedPrivyUser) => {
                    syncPrivyUser(updatedPrivyUser).then(() => invalidateUser())
                    return "Farcaster unlinked successfully"
                },
                error: (error) => {
                    return error.message;
                },
            })
        }
    }


    return (
        <div className="flex flex-row gap-2">
            {username && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                        <div className={cn(
                            "flex flex-1 p-3 border items-center gap-1.5 rounded-lg h-10",
                            isIntermediateState && "opacity-50"
                        )}>
                            <Image
                                src="/assets/icons/circle-check-green.svg"
                                height={16.67}
                                width={16.67}
                                alt="Verified"
                            />
                            <p className="text-sm">@{username}</p>
                        </div>
                    </div>
                </div>
            )}

            {username ?
                <Button
                    variant="secondary"
                    onClick={handleUnlinkFarcaster}
                    className={cn(isIntermediateState && "opacity-50")}
                >
                    Disconnect
                </Button>
                :
                <Button
                    variant="primary"
                    onClick={(event) => {
                        event.preventDefault()
                        linkFarcaster()
                    }}
                >
                    {children}
                </Button>
            }
        </div>
    )
}
