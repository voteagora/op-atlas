"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import { useUpdateEmail } from "@/lib/hooks"
import { UserWithEmails } from "@/lib/types"
import { useAppDialogs } from "@/providers/DialogProvider"

import { Badge } from "../common/Badge"
import { Input } from "../ui/input"

export function EditEmail({ user }: { user: UserWithEmails }) {
  const [email, setEmail] = useState(user.emails[0]?.email)
  const [isEditing, setIsEditing] = useState(false)
  const updateEmail = useUpdateEmail()
  const { setOpenDialog } = useAppDialogs()

  const onEditEmail = async () => {
    if (!email) return
    if (user.emails[0]?.email === email) {
      setIsEditing(false)
      return
    }

    await updateEmail(email)
    setIsEditing(false)
    toast.success("Email updated")
  }

  useEffect(() => {
    setEmail(user.emails[0]?.email)
  }, [user.emails])

  return (
    <div className="flex flex-col gap-6">
      <h4 className="text-h4">Email</h4>
      <div>
        Please add an email for important messages. This is required to apply
        for and receive Retro Funding. It should be a personal email where we
        can reliably reach you. Don&apos;t worry, we&apos;ll keep it private.
      </div>

      {user.emails.length > 0 ? (
        <div className="space-y-2">
          <span className="text-sm font-medium">Email</span>
          <div className="flex space-x-1.5 items-center">
            <Input
              value={email ?? ""}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              readOnly={!isEditing}
            />
            {isEditing ? (
              <Button
                disabled={email === ""}
                onClick={onEditEmail}
                variant={
                  user.emails[0]?.email === email ? "secondary" : "primary"
                }
              >
                {user.emails[0]?.email === email ? "Cancel" : "Save"}
              </Button>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="secondary">
                Edit
              </Button>
            )}
          </div>
        </div>
      ) : (
        <Button className="w-fit" onClick={() => setOpenDialog("email")}>
          Add email
        </Button>
      )}
    </div>
  )
}
