"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import { useUser } from "@/hooks/db/useUser"
import { updateGovForumProfileUrl } from "@/lib/actions/users"
import { cn } from "@/lib/utils"

import { Input } from "../ui/input"

export function GovForumConnection({ userId }: { userId: string }) {
  const { user, invalidate: invalidateUser } = useUser({
    id: userId,
    enabled: true,
  })

  const [govForumProfileUrl, setGovForumProfileUrl] = useState(
    user?.govForumProfileUrl || "",
  )

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
    if (!govForumProfileUrl) {
      toast.error("Please enter a profile URL")
      return
    }

    if (user?.govForumProfileUrl === govForumProfileUrl) {
      toast.error("Please enter a different profile URL")
      return
    }

    if (!isValidGovForumUrl(govForumProfileUrl)) {
      toast.error(
        "Please enter a valid gov forum profile URL (format: https://gov.optimism.io/u/yourname/summary)",
      )
      return
    }

    toast.promise(
      updateGovForumProfileUrl(govForumProfileUrl).then(() => invalidateUser()),
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
            value={govForumProfileUrl}
            onChange={(e) => setGovForumProfileUrl(e.target.value)}
            className={cn(user?.govForumProfileUrl && "pl-10")}
            readOnly={!isEditing}
          />
        </div>
        {isEditing ? (
          <Button onClick={handleSave}>Save</Button>
        ) : (
          <Button onClick={() => setIsEditing(true)} variant="secondary">
            Edit
          </Button>
        )}
      </div>
    </div>
  )
}
