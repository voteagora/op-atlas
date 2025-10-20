"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import { useUser } from "@/hooks/db/useUser"
import { updateGovForumProfileUrl } from "@/lib/actions/users"
import { cn } from "@/lib/utils"

import { Input } from "../ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function GovForumConnection({ userId }: { userId: string }) {
  const { user, invalidate: invalidateUser } = useUser({
    id: userId,
    enabled: true,
  })

  const [govForumProfileUrl, setGovForumProfileUrl] = useState(
    user?.govForumProfileUrl || "",
  )
  const [username, setUsername] = useState("")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (user?.govForumProfileUrl) {
      setGovForumProfileUrl(user.govForumProfileUrl)
    }
  }, [user])

  const [isEditing, setIsEditing] = useState(false)

  const isValidGovForumUrl = (url: string) => {
    const pattern = /^https:\/\/gov\.optimism\.io\/u\/[a-zA-Z0-9-_.]+\/summary$/
    return pattern.test(url)
  }

  const handleSave = () => {
    if (!username) {
      toast.error("Please enter a username")
      return
    }

    const constructedUrl = `https://gov.optimism.io/u/${username}/summary`

    if (user?.govForumProfileUrl === constructedUrl) {
      toast.error("Please enter a different username")
      return
    }

    if (!isValidGovForumUrl(constructedUrl)) {
      toast.error(
        "Username produces invalid URL. Expected https://gov.optimism.io/u/username/summary",
      )
      return
    }

    toast.promise(
      updateGovForumProfileUrl(constructedUrl)
        .then(() => invalidateUser())
        .then(() => setOpen(false)),
      {
        loading: "Updating profile URL...",
        success: "Profile URL updated successfully",
        error: (error) => error.message || "Failed to update profile URL",
      },
    )
  }

  // TODO: This is annoying, we should not need to check if the profile is complete here.
  useEffect(() => {
    const isProfileComplete = () => {
      return (
        user?.govForumProfileUrl &&
        user?.github &&
        user?.emails.length > 0 &&
        user?.name &&
        user?.imageUrl
      )
    }

    if (isProfileComplete()) {
      toast.success("Profile complete! 🎉", {
        action: {
          label: "View Profile",
          onClick: () => window.open(`/${user?.username}`, "_blank"),
        },
      })
    }
  }, [user])

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex gap-x-2">
        <div className="relative flex-1">
          {user?.govForumProfileUrl && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
              <Image
                src="/assets/icons/tickIcon.svg"
                alt="Verified"
                width={20}
                height={20}
              />
            </div>
          )}
          <Input
            placeholder="https://gov.optimism.io/u/yourname/summary"
            value={user?.govForumProfileUrl || ""}
            readOnly
            className={cn(user?.govForumProfileUrl && "pl-10")}
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary">{user?.govForumProfileUrl ? "Edit" : "Connect"}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect Governance Forum</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <div className="text-xs text-secondary-foreground">
                We will construct your profile URL as https://gov.optimism.io/u/username/summary
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

