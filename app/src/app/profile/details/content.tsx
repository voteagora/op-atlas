"use client"

import ExtendedLink from "@/components/common/ExtendedLink"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useUser } from "@/hooks/useUser"
import { Session } from "next-auth"

export const ProfileDetailsContent = ({ session }: { session: Session }) => {
  const { user } = useUser({ id: session?.user?.id, enabled: !!session?.user })

  const username = user?.username || session?.user?.name
  const imageUrl = user?.imageUrl || session?.user?.image
  const bio = user?.bio || ""

  return (
    <div className="flex flex-col gap-2">
      <div className="text-foreground font-medium text-sm">
        Details from Farcaster
      </div>
      <div className="border border-border rounded-xl p-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="text-foreground font-medium text-sm">Photo</div>
            <Avatar className="!w-20 !h-20">
              <AvatarImage src={imageUrl || ""} alt="avatar" />
              <AvatarFallback>{username}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-foreground font-medium text-sm">Name</div>
            <Input value={username ?? ""} disabled />
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-foreground font-medium text-sm">Username</div>
            <Input value={username ? `@${username}` : ""} disabled />
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-foreground font-medium text-sm">Bio</div>
            <Input value={bio} disabled />
          </div>

          <ExtendedLink
            as="button"
            href="https://warpcast.com/"
            text="Edit on Warpcast"
          />
        </div>
      </div>
    </div>
  )
}
