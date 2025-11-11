import { useLinkAccount, usePrivy } from "@privy-io/react-auth"
import { useSession } from "next-auth/react"
import { useRef } from "react"
import { toast } from "sonner"

import { syncPrivyUser } from "@/db/privy"
import { useAnalytics } from "@/providers/AnalyticsProvider"

import { useUser } from "../db/useUser"
import { useHandlePrivyErrors } from "../useHandlePrivyErrors"

export const usePrivyFarcaster = (userId: string) => {
  const isLinking = useRef(false)
  const { data: session } = useSession()
  const { track } = useAnalytics()
  const onError = useHandlePrivyErrors()
  const { invalidate: invalidateUser } = useUser({ id: userId, enabled: false })
  const { user: privyUser, unlinkFarcaster } = usePrivy()

  const { linkFarcaster } = useLinkAccount({
    onSuccess: async ({ user: updatedPrivyUser, linkMethod }) => {
      if (linkMethod === "farcaster" && isLinking.current) {
        track("Farcaster Linked", {
          userId,
          elementType: "Hook",
          elementName: "usePrivyFarcaster",
        })
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

  const showUnavailableToast = () =>
    toast.error(
      "Farcaster linking is unavailable while impersonating or when Privy isn't connected.",
    )

  if (!privyUser || session?.impersonation?.isActive) {
    return {
      linkFarcaster: showUnavailableToast,
      unlinkFarcaster: showUnavailableToast,
    }
  }

  const handleUnlinkFarcaster = () => {
    if (privyUser?.farcaster?.fid) {
      toast.promise(unlinkFarcaster(Number(privyUser.farcaster.fid)), {
        loading: "Unlinking farcaster...",
        success: (updatedPrivyUser) => {
          syncPrivyUser(updatedPrivyUser).then(() => invalidateUser())
          return "Farcaster unlinked successfully"
        },
        error: (error) => error.message,
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
