import { useLinkAccount, usePrivy } from "@privy-io/react-auth"
import { useEffect } from "react"
import { toast } from "sonner"

import { syncPrivyUser } from "@/db/privy"
import { useUser } from "@/hooks/db/useUser"
import { useHandlePrivyErrors } from "@/hooks/useHandlePrivyErrors"
import { setUserIsNotDeveloper } from "@/lib/actions/users"
import { useAnalytics } from "@/providers/AnalyticsProvider"

const LINKING_STATE_KEY = "privy_github_linking_state"

export const usePrivyLinkGithub = (userId: string) => {
  const { user: privyUser, unlinkGithub } = usePrivy()
  const { user, invalidate: invalidateUser } = useUser({
    id: userId,
    enabled: true,
  })
  const onError = useHandlePrivyErrors()
  const { track } = useAnalytics()
  const isLinking = () => localStorage.getItem(LINKING_STATE_KEY) === "true"
  const setIsLinking = (value: boolean) =>
    localStorage.setItem(LINKING_STATE_KEY, String(value))

  const handleUnlinkGithub = () => {
    if (privyUser?.github?.subject) {
      track("Github Unlinked", { userId })
      toast.promise(unlinkGithub(privyUser.github.subject), {
        loading: "Unlinking github...",
        success: (updatedPrivyUser) => {
          syncPrivyUser(updatedPrivyUser).then(() => invalidateUser())
          return "Github unlinked successfully"
        },
        error: (error) => {
          return error.message
        },
      })
    }
  }

  const { linkGithub } = useLinkAccount({
    onSuccess: async ({ user: updatedPrivyUser, linkMethod }) => {
      track("Github Linked", { userId })
      if (linkMethod === "github" && isLinking()) {
        toast.promise(
          syncPrivyUser(updatedPrivyUser)
            .then(() => invalidateUser())
            .then(() => setIsLinking(false)),
          {
            loading: "Linking github...",
            success: "Github linked successfully",
            error: "Failed to link github",
          },
        )
      }
    },
    onError,
  })

  const linkGithubWithState = () => {
    setIsLinking(true)
    linkGithub()
  }

  const toggleIsDeveloper = () => {
    const desiredState = !user?.notDeveloper

    toast.promise(setUserIsNotDeveloper(desiredState), {
      loading: "Updating developer status...",
      success: () => {
        if (desiredState && privyUser?.github?.subject) {
          handleUnlinkGithub()
        } else {
          invalidateUser()
        }
        return "Developer status updated successfully"
      },
      error: "Failed to update developer status",
    })
  }

  return {
    linkGithub: linkGithubWithState,
    unlinkGithub: handleUnlinkGithub,
    toggleIsDeveloper,
  }
}
