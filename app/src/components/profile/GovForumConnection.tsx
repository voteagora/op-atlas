"use client"

import { X } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import { CheckboxCircleFIll } from "@/components/icons/remix"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  const [username, setUsername] = useState("")
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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

    setIsSaving(true)
    const promise = updateGovForumProfileUrl(constructedUrl)
      .then(() => invalidateUser())
      .then(() => setOpen(false))

    toast.promise(promise, {
      loading: "Updating profile URL...",
      success: "Profile URL updated successfully",
      error: (error) => error.message || "Failed to update profile URL",
    })

    promise.finally(() => setIsSaving(false))
  }

  const handleClear = () => {
    const promise = updateGovForumProfileUrl("")
      .then(() => invalidateUser())
      .then(() => setGovForumProfileUrl(""))

    toast.promise(promise, {
      loading: "Clearing profile URL...",
      success: "Profile URL cleared",
      error: (error) => error.message || "Failed to clear profile URL",
    })
  }

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
        {user?.govForumProfileUrl && (
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
              <CheckboxCircleFIll className="w-5 h-5" fill="#1DBA6A" />
            </div>
            <Input
              placeholder="https://gov.optimism.io/u/yourname/summary"
              value={user.govForumProfileUrl.replace(
                /^https:\/\/gov\.optimism\.io\/u\//,
                "../",
              )}
              readOnly
              className="pl-10"
            />
          </div>
        )}
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v)
            if (!v) {
              setUsername("")
              setIsSaving(false)
            }
          }}
        >
          <DialogTrigger asChild>
            <Button variant="secondary">
              {user?.govForumProfileUrl ? "Edit" : "Connect"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader className="text-center mb-0">
              <DialogTitle className="text-center font-medium text-xl leading-7">
                Governance Forum
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-1 text-center">
              <p className="text-normal leading-6 text-secondary-foreground">
                Link to your profile so anyone can find you on
                <br />
                <a
                  href="https://gov.optimism.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  gov.optimism.io
                </a>
                .
              </p>
              <Input
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && username.trim()) {
                    handleSave()
                  }
                }}
                className="mt-4"
              />
              <Button
                onClick={handleSave}
                variant="primary"
                isLoading={isSaving}
                disabled={!username.trim() || isSaving}
                className="w-full"
              >
                Connect
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {user?.govForumProfileUrl && (
          <Button
            variant="secondary"
            size="icon"
            aria-label="Clear Gov Forum profile"
            onClick={handleClear}
            className="w-10 h-10"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
