"use client"

import { syncPrivyUser } from "@/db/privy";
import { useUser } from "@/hooks/useUser";
import { useLinkAccount, usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "../common/Button";

export const FarcasterConnection = ({ userId }: { userId: string }) => {

    const { unlinkFarcaster } = usePrivy()
    const { user, invalidate: invalidateUser } = useUser({ id: userId, enabled: true })

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
                error: "Failed to unlink farcaster",
            })
        }
    }

    return (
        <div className="flex flex-row gap-2">
            {user?.farcasterId && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                        <div className="flex flex-1 p-3 border items-center gap-1.5 rounded-lg h-10">
                            <Image
                                src="/assets/icons/circle-check-green.svg"
                                height={16.67}
                                width={16.67}
                                alt="Verified"
                            />
                            <p className="text-sm">@{user.username}</p>
                        </div>
                    </div>
                </div>
            )}

            {user?.farcasterId ?
                <Button variant="secondary" onClick={handleUnlinkFarcaster}>Disconnect</Button>
                :
                <Button variant="primary" onClick={linkFarcaster}>Connect</Button>
            }
        </div>

    )
}
