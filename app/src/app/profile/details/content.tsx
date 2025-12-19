"use client"

import { Session } from "next-auth"

import { UserFill } from "@/components/icons/remix"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useUser } from "@/hooks/db/useUser"

export const ProfileDetailsContent = ({ session }: { session: Session }) => {
  const { user } = useUser({ id: session?.user?.id, enabled: !!session?.user })

  const username = ""
  const imageUrl = ""
  const bio = ""

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-4">
        <h4 className="text-foreground text-base font-medium">
          Photo, display name, username, and bio
        </h4>
      </div>
      <div className="border border-border rounded-xl p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="text-secondary-foreground font-normal text-sm">Photo</div>
            <Avatar className="!w-20 !h-20">
              <AvatarImage src={imageUrl || ""} alt="avatar" />
              <AvatarFallback
                className="w-20 h-20 flex items-center justify-center rounded-full border border-tertiary"
                style={{ backgroundColor: "#F2F3F8" }}
              >
                <UserFill className="w-6 h-6 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-secondary-foreground font-normal text-sm">Name</div>
            <Input
              value={username ?? ""}
              placeholder="Your name"
              disabled
              className="text-secondary-foreground"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-secondary-foreground font-normal text-sm">Username</div>
            <Input
              value={username ? `@${username}` : ""}
              placeholder="Your username"
              disabled
              className="text-secondary-foreground"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-secondary-foreground font-normal text-sm">Bio</div>
            <Textarea
              value={bio}
              placeholder="Your bio"
              disabled
              className="h-20 resize-none text-secondary-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
