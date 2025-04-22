"use client"

import { useLinkAccount, usePrivy } from "@privy-io/react-auth";
import { Button } from "../common/Button";
import { toast } from "sonner";
import { syncPrivyUser } from "@/db/users";

export function FarcasterConnection() {

    const { user: privyUser, unlinkFarcaster } = usePrivy()

    const { linkFarcaster } = useLinkAccount({
        onSuccess: async ({ user: updatedPrivyUser }) => {

            toast.promise(syncPrivyUser(updatedPrivyUser), {
                loading: "Linking farcaster...",
                success: "Farcaster linked successfully",
                error: "Failed to link farcaster",
            })
        },
    })

    const handleUnlinkFarcaster = () => {
        if (privyUser?.farcaster?.fid) {
            toast.promise(unlinkFarcaster(privyUser.farcaster.fid), {
                loading: "Unlinking farcaster...",
                success: (updatedPrivyUser) => {
                    syncPrivyUser(updatedPrivyUser)
                    return "Farcaster unlinked successfully"
                },
                error: "Failed to unlink farcaster",
            })
        }
    }

    return (
        <div>
            <h3>Farcaster</h3>
            {privyUser?.farcaster?.fid ?
                <Button variant="secondary" onClick={handleUnlinkFarcaster}>Disconnect</Button>
                :
                <Button variant="primary" onClick={linkFarcaster}>Connect</Button>
            }
        </div>
    )
}
