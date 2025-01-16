"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import { updateGovForumProfileUrl } from "@/lib/actions/users"
import { UserWithEmails } from "@/lib/types"
import { cn } from "@/lib/utils"

import { Input } from "../ui/input"

export function GovForumConnection({ user }: { user: UserWithEmails }) {
  const [govForumProfileUrl, setGovForumProfileUrl] = useState(
    user.govForumProfileUrl || "",
  )
  const [isEditing, setIsEditing] = useState(false)

  const [loading, setLoading] = useState(false)

  const isValidGovForumUrl = (url: string) => {
    const pattern = /^https:\/\/gov\.optimism\.io\/u\/[a-zA-Z0-9-_]+\/summary$/
    return pattern.test(url)
  }

  const handleSave = async () => {
    if (!govForumProfileUrl) {
      toast.error("Please enter a profile URL")
      return
    }

    if (!isValidGovForumUrl(govForumProfileUrl)) {
      toast.error(
        "Please enter a valid gov forum profile URL (format: https://gov.optimism.io/u/yourname/summary)",
      )
      return
    }

    setLoading(true)
    const result = await updateGovForumProfileUrl(govForumProfileUrl)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Profile URL updated")
    }
    setLoading(false)
    setIsEditing(false)
  }

  useEffect(() => {
    const isProfileComplete = () => {
      return (
        user.govForumProfileUrl &&
        user.github &&
        user.emails.length > 0 &&
        user.name &&
        user.imageUrl
      )
    }

    if (isProfileComplete()) {
      toast.success("Profile complete! 🎉", {
        action: {
          label: "View Profile",
          onClick: () => window.open(`/${user.username}`, "_blank"),
        },
      })
    }
  }, [user])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-[6px]">
        <Image
          src="/assets/icons/op-icon.svg"
          alt="Gov Forum"
          height={20}
          width={20}
        />
        <h3 className="text-xl font-semibold text-foreground">
          Collective Governance Forum
        </h3>
      </div>
      <p className="text-secondary-foreground">
        Link your profile so anyone can find you on{" "}
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

      <div className="flex gap-x-2">
        <div className="relative flex-1">
          {user.govForumProfileUrl && (
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
            className={cn(user.govForumProfileUrl && "pl-10")}
            readOnly={!isEditing}
          />
        </div>
        {isEditing ? (
          <Button
            onClick={handleSave}
            disabled={
              loading ||
              user.govForumProfileUrl === govForumProfileUrl ||
              !govForumProfileUrl
            }
          >
            Save
          </Button>
        ) : (
          <Button onClick={() => setIsEditing(true)} variant="secondary">
            Edit
          </Button>
        )}
      </div>
    </div>
  )
}
