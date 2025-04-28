"use client"


import { Button } from "@/components/common/Button"
import { usePrivyEmail } from "@/hooks/usePrivyLinkEmail"
import { useUser } from "@/hooks/useUser"
import { Mail } from "lucide-react"

export const EmailConnection = ({ userId }: { userId: string }) => {
  const { user } = useUser({ id: userId, enabled: true })

  const { linkEmail, updateEmail, unlinkEmail } = usePrivyEmail(userId)

  const email = user?.emails[0]?.email;

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
            linkEmail()
          }
        }}
      >
        {email ? "Update" : "Add email"}
      </Button>

      {email && (
        <Button variant="secondary" onClick={unlinkEmail}>
          Delete
        </Button>
      )}
    </div>
  )
}
