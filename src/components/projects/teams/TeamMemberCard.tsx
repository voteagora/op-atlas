import * as React from "react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AvatarOwnerStar } from "./AvatarOwnerStar"

interface TeamCardProps {
  name: string
  username: string
  avatarSrc: string
  isOwner?: boolean
  onButtonClick?: () => void
}

export const TeamMemberCard: React.FC<TeamCardProps> = ({
  name,
  username,
  avatarSrc,
  isOwner,
  onButtonClick,
}) => {
  return (
    <div className="w-[172px] h-36 relative bg-white border rounded-xl p-3 ">
      {!isOwner && (
        <Image
          src="/assets/icons/crossIcon.svg"
          width={11}
          height={10}
          alt="img"
          className="absolute top-2 right-2 cursor-pointer"
          onClick={onButtonClick}
        />
      )}
      <div className="flex flex-col mt-2.5 gap-2 justify-center items-center text-center">
        <div className="relative w-12 h-12">
          <Avatar className="w-full h-full">
            <AvatarImage src={avatarSrc} alt="avatar" />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          {isOwner && <AvatarOwnerStar className="absolute -top-1 -right-1" />}
        </div>
        <div>
          <p className="text-sm text-secondary-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{username}</p>
        </div>
      </div>
    </div>
  )
}
