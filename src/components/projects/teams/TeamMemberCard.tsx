import * as React from "react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TeamCardProps {
  name: string
  username: string
  avatarSrc: string
  isOwner?: boolean
}

export const TeamMemberCard: React.FC<TeamCardProps> = ({
  name,
  username,
  avatarSrc,
  isOwner,
}) => (
  <div className="w-[172px] h-36 relative bg-white border rounded-xl p-3 ">
    {isOwner && (
      <Image
        src="/assets/icons/starIcon.svg"
        width={11}
        height={10}
        alt="img"
        className="absolute top-2 right-2"
      />
    )}

    <div className="flex flex-col mt-2.5 justify-center items-center text-center">
      <Avatar className="!w-12 !h-12">
        <AvatarImage src={avatarSrc} alt="avatar" />
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
      <p className="text-sm text-secondary-foreground mt-2">{name}</p>
      <p className="text-xs text-muted-foreground">{username}</p>
    </div>
  </div>
)
