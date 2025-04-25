"use client"

import { syncPrivyUser } from "@/db/privy";
import { useUser } from "@/hooks/useUser";
import { useLinkAccount, usePrivy } from "@privy-io/react-auth";
import { Session } from "next-auth";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "../common/Button";

export const FarcasterConnection = ({ session }: { session: Session }) => {

    const { user: privyUser, unlinkFarcaster } = usePrivy()
    const { user, invalidate: invalidateUser } = useUser({ id: session.user.id, enabled: !!session.user })

    const username = user?.farcasterId ? user.username : privyUser?.farcaster?.username;

    const { linkFarcaster } = useLinkAccount({
        onSuccess: async ({ user: updatedPrivyUser, linkMethod }) => {
            if (linkMethod === "farcaster") {
                toast.promise(syncPrivyUser(updatedPrivyUser).then(() => invalidateUser()), {
                    loading: "Linking farcaster...",
                    success: "Farcaster linked successfully",
                    error: "Failed to link farcaster",
                })
            }
        },
    })

    const handleUnlinkFarcaster = () => {
        if (privyUser?.farcaster?.fid) {
            toast.promise(unlinkFarcaster(privyUser.farcaster.fid), {
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
            {privyUser?.farcaster?.username && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                        <div className="flex flex-1 p-3 border items-center gap-1.5 rounded-lg h-10">
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


            {privyUser?.farcaster?.fid ?
                <Button variant="secondary" onClick={handleUnlinkFarcaster}>Disconnect</Button>
                :
                <Button variant="primary" onClick={linkFarcaster}>Connect</Button>
            }
        </div>

    )
}
