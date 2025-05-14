import { useLinkAccount, usePrivy } from "@privy-io/react-auth"
import { useRef } from "react"
import { toast } from "sonner"

import { syncPrivyUser } from "@/db/privy"

import { useUser } from "../db/useUser"
import { useHandlePrivyErrors } from "../useHandlePrivyErrors"

export const usePrivyFarcaster = (userId: string) => {
  const isLinking = useRef(false)

  const onError = useHandlePrivyErrors()
  const { invalidate: invalidateUser } = useUser({ id: userId, enabled: false })
  const { user: privyUser, unlinkFarcaster } = usePrivy()

  const { linkFarcaster } = useLinkAccount({
    onSuccess: async ({ user: updatedPrivyUser, linkMethod }) => {
      if (linkMethod === "farcaster" && isLinking.current) {
        toast.promise(
          syncPrivyUser(updatedPrivyUser)
            .then(() => invalidateUser())
            .then(() => (isLinking.current = false)),
          {
            loading: "Linking farcaster...",
            success: "Farcaster linked successfully",
            error: "Failed to link farcaster",
          },
        )
      }
    },
    onError,
  })

  const handleUnlinkFarcaster = () => {
    if (privyUser?.farcaster?.fid) {
      toast.promise(unlinkFarcaster(Number(privyUser.farcaster.fid)), {
        loading: "Unlinking farcaster...",
        success: (updatedPrivyUser) => {
          syncPrivyUser(updatedPrivyUser)
            .then(() => invalidateUser())
            .then(() => "User invalidates")
          return "Farcaster unlinked successfully"
        },
        error: (error) => {
          return error.message
        },
      })
    }
  }

  const linkFarcasterWithState = () => {
    isLinking.current = true
    linkFarcaster()
  }

  return {
    linkFarcaster: linkFarcasterWithState,
    unlinkFarcaster: handleUnlinkFarcaster,
  }
}
