"use client"

import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import { syncPrivyUser } from "@/db/privy"
import { useUser } from "@/hooks/useUser"
import {
  useLinkAccount,
  usePrivy,
  useUpdateAccount,
} from "@privy-io/react-auth"
import { Mail } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRef } from "react"

export const EmailConnection = () => {

  const { user: privyUser, unlinkEmail } = usePrivy()
  const { data: session } = useSession()
  const { invalidate: invalidateUser, user } = useUser({ id: session?.user?.id || "", enabled: !!session?.user })
  const isLinking = useRef(false);

  const email = user?.emails[0]?.email;

  const { updateEmail } = useUpdateAccount({
    onSuccess: async ({ user: updatedPrivyUser, updateMethod }) => {
      if (updateMethod === "email") {
        toast.promise(syncPrivyUser(updatedPrivyUser)
          .then(() => invalidateUser()), {
          loading: "Updating email...",
          success: "Email updated successfully",
          error: "Failed to update email",
        })
      }
    },
  })

  const { linkEmail } = useLinkAccount({
    onSuccess: async ({ user: updatedPrivyUser, linkMethod }) => {
      if (linkMethod === "email" && isLinking.current) {
        toast.promise(syncPrivyUser(updatedPrivyUser)
          .then(() => invalidateUser())
          .then(() => isLinking.current = false),
          {
            loading: "Adding email...",
            success: "Email added successfully",
            error: "Failed to add email",
          })
      }
    },
  })

  const handleUnlinkEmail = () => {
    if (privyUser?.email) {
      toast.promise(unlinkEmail(privyUser.email.address), {
        loading: "Deleting email...",
        success: (updatedPrivyUser) => {
          syncPrivyUser(updatedPrivyUser)
            .then(() => invalidateUser())
          return "Email deleted successfully"
        },
        error: "Failed to delete email",
      })
    }
  }

  return (
    <div className="flex space-x-1.5">
      {email && (
        <div className="input-container">
          <Mail size={16} fill="#0F111A" color="#fff" />
          <span>{email}</span>
        </div>
      )}
      <Button
        variant={email ? "secondary" : "primary"}
        onClick={() => {
          if (email) {
            updateEmail()
          } else {
            isLinking.current = true;
            linkEmail()
          }
        }}
      >
        {email ? "Update" : "Add email"}
      </Button>

      {email && (
        <Button variant="secondary" onClick={handleUnlinkEmail}>
          Delete
        </Button>
      )}
    </div>
  )
}
