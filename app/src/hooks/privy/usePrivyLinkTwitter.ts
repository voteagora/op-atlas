import { useLinkAccount, usePrivy } from "@privy-io/react-auth"
import { toast } from "sonner"

import { syncPrivyUser } from "@/db/privy"
import { useUser } from "@/hooks/db/useUser"
import { useHandlePrivyErrors } from "@/hooks/useHandlePrivyErrors"
import { useAnalytics } from "@/providers/AnalyticsProvider"

export const usePrivyLinkTwitter = (userId: string) => {
  const { user: privyUser, unlinkTwitter } = usePrivy()
  const { invalidate: invalidateUser } = useUser({
    id: userId,
    enabled: true,
  })
  const onError = useHandlePrivyErrors()
  const { track } = useAnalytics()

  const handleUnlinkTwitter = () => {
    if (privyUser?.twitter?.subject) {
      track("Twitter Unlinked", {
        userId,
        elementType: "Hook",
        elementName: "usePrivyLinkTwitter",
      })
      toast.promise(unlinkTwitter(privyUser.twitter.subject), {
        loading: "Unlinking X...",
        success: (updatedPrivyUser) => {
          syncPrivyUser(updatedPrivyUser).then(() => invalidateUser())
          return "X unlinked successfully"
        },
        error: (error) => {
          return error.message
        },
      })
    }
  }

  const { linkTwitter } = useLinkAccount({
    onSuccess: async ({ user: updatedPrivyUser, linkMethod }) => {
      if (linkMethod === "twitter") {
        track("Twitter Linked", {
          userId,
          elementType: "Hook",
          elementName: "usePrivyLinkTwitter",
        })
        toast.promise(
          syncPrivyUser(updatedPrivyUser).then(() => invalidateUser()),
          {
            loading: "Linking X...",
            success: "X linked successfully",
            error: "Failed to link X",
          },
        )
      }
    },
    onError,
  })

  return {
    linkTwitter,
    unlinkTwitter: handleUnlinkTwitter,
  }
}
