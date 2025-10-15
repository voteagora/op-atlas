"use client"

import { Session } from "next-auth"

import ExtendedLink from "@/components/common/ExtendedLink"
import { Farcaster } from "@/components/icons/socials"
import { UserFill } from "@/components/icons/remix"
import { FarcasterConnection } from "@/components/profile/FarcasterConnection"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useUser } from "@/hooks/db/useUser"

export const ProfileDetailsContent = ({ session }: { session: Session }) => {
  const { user } = useUser({ id: session?.user?.id, enabled: !!session?.user })

  const username = user?.username || session?.user?.name
  const imageUrl = user?.imageUrl || session?.user?.image
  const bio = user?.bio || ""

  return (
    <div className="flex flex-col gap-2">
      <div className="text-foreground text-base font-normal mb-4">
        Photo, display name, username and bio.
      </div>
      <div className="border border-border rounded-xl p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="text-foreground font-normal text-sm">Photo</div>
            <Avatar className="!w-20 !h-20">
              <AvatarImage src={imageUrl || ""} alt="avatar" />
              <AvatarFallback className="w-20 h-20 flex items-center justify-center rounded-full border border-tertiary" style={{ backgroundColor: '#F2F3F8' }}>
                <UserFill className="w-6 h-6 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-foreground font-normal text-sm">Name</div>
            <Input value={username ?? ""} disabled />
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-foreground font-normal text-sm">Username</div>
            <Input value={username ? `@${username}` : ""} disabled />
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-foreground font-normal text-sm">Bio</div>
            <Textarea value={bio} disabled className="h-20 resize-none" />
          </div>

          {user?.farcasterId && (
            <ExtendedLink
              as="button"
              href="https://warpcast.com/"
              text="Edit on Warpcast"
            />
          )}
        </div>
      </div>

      {!user?.farcasterId && (
        <div className="mt-2">
          <FarcasterConnection userId={session.user.id}>
            <Farcaster fill="#FFFFFF" className="w-[20px] h-[20px]" />
            Import from Farcaster
          </FarcasterConnection>
        </div>
      )}
    </div>
  )
}
