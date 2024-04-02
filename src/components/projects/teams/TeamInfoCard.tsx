import * as React from "react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TeamCardProps {
  name: string
  username: string
  avatarSrc: string
}

export const TeamInfoCard: React.FC<TeamCardProps> = ({
  name,
  username,
  avatarSrc,
}) => (
  <div className="w-[172px] h-36 bg-white border rounded-xl p-3 ">
    <div className="flex flex-col justify-end items-end">
      <Image
        src="/assets/icons/starIcon.svg"
        width={11}
        height={10}
        alt="img"
        className="items-end"
      />
    </div>
    <div className="flex flex-col justify-center items-center text-center">
      <Avatar className="!w-12 !h-12">
        <AvatarImage src={avatarSrc} alt="avatar" />
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
      <p className="text-sm text-secondary-foreground mt-2">{name}</p>
      <p className="text-xs text-muted-foreground">@{username}</p>
    </div>
  </div>
)
