import {
  useLinkAccount,
  usePrivy,
  useUpdateAccount,
} from "@privy-io/react-auth"
import { useRef } from "react"
import { toast } from "sonner"

import { syncPrivyUser } from "@/db/privy"

import { useUser } from "../db/useUser"
import { useHandlePrivyErrors } from "../useHandlePrivyErrors"

export const usePrivyEmail = (userId: string) => {
  const isLinking = useRef(false)

  const onError = useHandlePrivyErrors()
  const { invalidate: invalidateUser } = useUser({ id: userId, enabled: false })
  const { user: privyUser, unlinkEmail } = usePrivy()

  const { linkEmail } = useLinkAccount({
    onSuccess: async ({ user: updatedPrivyUser, linkMethod }) => {
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
  })

  const { updateEmail } = useUpdateAccount({
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
  })

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
