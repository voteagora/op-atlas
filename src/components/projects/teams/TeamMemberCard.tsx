import * as React from "react"
import Image from "next/image"
import { User } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TeamRole } from "@/lib/types"
import { titlecase } from "@/lib/utils"
import { AvatarOwnerStar } from "./AvatarOwnerStar"

export const TeamMemberCard = ({
  user,
  role,
  onRemove,
}: {
  user: User
  role: TeamRole
  onRemove: () => void
}) => {
  return (
    <div className="aspect-square flex flex-col items-center justify-center gap-y-2 flex-1 relative border rounded-xl px-4">
      {/* {!isOwner && (
        <Image
          src="/assets/icons/crossIcon.svg"
          width={11}
          height={10}
          alt="img"
          className="absolute top-2 right-2 cursor-pointer"
          onClick={onRemove}
        />
      )} */}

      <div className="relative w-12 h-12">
        <Avatar className="w-full h-full">
          <AvatarImage src={user.imageUrl ?? undefined} alt="avatar" />
          <AvatarFallback>{user.name?.[0]}</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-col items-center text-center">
        <p className="text-sm">{user.name}</p>
        <p className="text-xs text-muted-foreground">{titlecase(role)}</p>
      </div>
    </div>
  )
}
