import {
  useLinkAccount,
  usePrivy,
  useUpdateAccount,
} from "@privy-io/react-auth"
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
        "[usePrivyEmail] Privy hook unavailable – returning no-op handlers.",
        error,
      )
    }
    return null
  }
}

export const usePrivyEmail = (userId: string) => {
  const isLinking = useRef(false)
  const { data: session } = useSession()

  const onError = useHandlePrivyErrors()
  const { invalidate: invalidateUser } = useUser({ id: userId, enabled: false })
  const privyContext = useSafePrivyHook(() => usePrivy())
  const { user: privyUser, unlinkEmail } = privyContext ?? {
    user: null,
    unlinkEmail: async () => {},
  }
  const { track } = useAnalytics()

  const linkAccount = useSafePrivyHook(() =>
    useLinkAccount({
      onSuccess: async ({ user: updatedPrivyUser, linkMethod }) => {
        track("Email Linked", {
          userId,
          elementType: "Hook",
          elementName: "UseLinkPrivyEmail",
        })
        if (linkMethod === "email" && isLinking.current) {
          toast.promise(
            syncPrivyUser(updatedPrivyUser)
              .then(() => invalidateUser())
              .then(() => (isLinking.current = false)),
            {
              loading: "Adding email...",
              success: "Email added successfully",
              error: "Failed to add email",
            },
          )
        }
      },
      onError,
    }),
  )

  const updateAccount = useSafePrivyHook(() =>
    useUpdateAccount({
      onSuccess: async ({ user: updatedPrivyUser, updateMethod }) => {
        if (updateMethod === "email" && isLinking.current) {
          toast.promise(
            syncPrivyUser(updatedPrivyUser)
              .then(() => invalidateUser())
              .then(() => (isLinking.current = false)),
            {
              loading: "Updating email...",
              success: "Email updated successfully",
              error: "Failed to update email",
            },
          )
        }
      },
      onError,
    }),
  )

  const privyUnavailable =
    !privyContext || !linkAccount || !updateAccount || !privyUser

  const showUnavailableToast = () =>
    toast.error(
      "Email linking is unavailable while impersonating or when Privy isn't connected.",
    )

  if (privyUnavailable || session?.impersonation?.isActive) {
    return {
      linkEmail: showUnavailableToast,
      updateEmail: showUnavailableToast,
      unlinkEmail: showUnavailableToast,
    }
  }

  const { linkEmail } = linkAccount
  const { updateEmail } = updateAccount

  const handleUnlinkEmail = () => {
    if (privyUser?.email) {
      toast.promise(unlinkEmail(privyUser.email.address), {
        loading: "Deleting email...",
        success: (updatedPrivyUser) => {
          syncPrivyUser(updatedPrivyUser)
            .then(() => invalidateUser())
            .then(() => "User invalidates")
          return "Email deleted successfully"
        },
        error: (error) => {
          return error.message
        },
      })
    }
  }

  const linkEmailWithState = () => {
    isLinking.current = true
    linkEmail()
  }

  const updateEmailWithState = () => {
    isLinking.current = true
    updateEmail()
  }

  return {
    linkEmail: linkEmailWithState,
    updateEmail: updateEmailWithState,
    unlinkEmail: handleUnlinkEmail,
  }
}
