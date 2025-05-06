import { memo } from "react"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { UserWithAddresses } from "@/lib/types"
import { cn } from "@/lib/utils"
import Image from "next/image"

import ProfileHeaderLinks from "./ProfileHeaderLinks"
import { isAddress } from "viem"
import { useEnsName } from "@/hooks/useEnsName"

const ProfileHeader = ({
  className,
  user,
}: {
  className?: string
  user: UserWithAddresses
}) => {

  const address = user?.addresses?.[0]?.address
  const validAddress = address && isAddress(address) ? (address as `0x${string}`) : undefined
  const { data: ensName } = useEnsName(validAddress)

  const publicUsername = () => {

    if (user.name) return user.name

    if (validAddress) {
      return ensName ?? `${validAddress.slice(0, 6)}`
    }

    if (user.username) {
      return user.username
    }
  }

  return (
    <div className={cn("flex gap-x-4", className)}>
      <div className="flex flex-col space-y-6">
        {user.imageUrl ? (
          <Avatar className="w-20 h-20 my-0.5">
            <AvatarImage src={user.imageUrl} />
          </Avatar>
        ) : (
          <div
            className="w-20 h-20 my-0.5 flex items-center justify-center rounded-full border border-dashed border-muted bg-none hover:bg-secondary group relative cursor-pointer"
          >
            <Image
              src="/assets/icons/user-icon.svg"
              alt="user"
              width={18}
              height={18}
            />
          </div>
        )}
        <div className="space-y-3">
          <div>
            <h2 className="flex items-center gap-x-2">{publicUsername()} </h2>
            <span>{user.bio}</span>
          </div>
          <ProfileHeaderLinks user={user} />
        </div>
      </div>
    </div>
  )
}

export default memo(ProfileHeader)
