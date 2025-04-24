"use client"

import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import { syncPrivyUser } from "@/db/privy"
import {
  useLinkAccount,
  usePrivy,
  useUpdateAccount,
} from "@privy-io/react-auth"
import { Mail } from "lucide-react"

export const EmailConnection = () => {

  const { user: privyUser, unlinkEmail } = usePrivy()

  const { updateEmail } = useUpdateAccount({
    onSuccess: async ({ user: updatedPrivyUser, updateMethod }) => {
      if (updateMethod === "email") {
        toast.promise(syncPrivyUser(updatedPrivyUser), {
          loading: "Updating email...",
          success: "Email updated successfully",
          error: "Failed to update email",
        })
      }
    },
  })

  const { linkEmail } = useLinkAccount({
    onSuccess: async ({ user: updatedPrivyUser, linkMethod }) => {
      if (linkMethod === "email") {
        toast.promise(syncPrivyUser(updatedPrivyUser), {
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
          return "Email deleted successfully"
        },
        error: "Failed to delete email",
      })
    }
  }

  return (
    <div className="flex space-x-1.5">
      {privyUser?.email && privyUser?.email?.address && (
        <div className="input-container">
          <Mail size={16} fill="#0F111A" color="#fff" />
          <span>{privyUser?.email?.address}</span>
        </div>
      )}
      <Button
        variant={privyUser?.email?.address ? "secondary" : "primary"}
        onClick={() => {
          privyUser?.email?.address ? updateEmail() : linkEmail()
        }}
      >
        {privyUser?.email?.address ? "Update email" : "Add email"}
      </Button>

      {privyUser?.email?.address && (
        <Button variant="secondary" onClick={handleUnlinkEmail}>
          Delete email
        </Button>
      )}
    </div>
  )
}
