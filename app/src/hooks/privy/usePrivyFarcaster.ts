import { useLinkAccount, usePrivy } from "@privy-io/react-auth"
import { useSession } from "next-auth/react"
import { useRef } from "react"
import { toast } from "sonner"

import { syncPrivyUser } from "@/db/privy"
import { useAnalytics } from "@/providers/AnalyticsProvider"

import { useUser } from "../db/useUser"
import { useHandlePrivyErrors } from "../useHandlePrivyErrors"

const useSafePrivyHook = <T,>(hook: () => T): T | null => {
  try {
    return hook()
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[usePrivyFarcaster] Privy hook unavailable – returning no-op handlers.",
        error,
      )
    }
    return null
  }
}

export const usePrivyFarcaster = (userId: string) => {
  const isLinking = useRef(false)
  const { data: session } = useSession()

  const onError = useHandlePrivyErrors()
  const { invalidate: invalidateUser } = useUser({ id: userId, enabled: false })
  const privyContext = useSafePrivyHook(() => usePrivy())
  const { user: privyUser, unlinkFarcaster } = privyContext ?? {
    user: null,
    unlinkFarcaster: async () => {},
  }
  const { track } = useAnalytics()

  const linkAccount = useSafePrivyHook(() =>
    useLinkAccount({
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
    }),
  )

  const privyUnavailable = !privyContext || !linkAccount || !privyUser
  const showUnavailableToast = () =>
    toast.error(
      "Farcaster linking is unavailable while impersonating or when Privy isn't connected.",
    )

  if (privyUnavailable || session?.impersonation?.isActive) {
    return {
      linkFarcaster: showUnavailableToast,
      unlinkFarcaster: showUnavailableToast,
    }
  }

  const { linkFarcaster } = linkAccount

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
