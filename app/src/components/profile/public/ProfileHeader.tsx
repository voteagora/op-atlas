"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { UserRoundCheck } from "lucide-react"

import { CitizenshipBadge } from "@/components/common/CitizenshipBadge"
import { PencilFill } from "@/components/icons/remix"
import { Avatar, AvatarBadge, AvatarImage } from "@/components/ui/avatar"
import { useCitizen } from "@/hooks/citizen/useCitizen"
import { useUsername } from "@/hooks/useUsername"
import { CITIZEN_TYPES } from "@/lib/constants"
import { UserWithAddresses } from "@/lib/types"
import { cn } from "@/lib/utils"

import ProfileHeaderLinks from "./ProfileHeaderLinks"

const ProfileHeader = ({
  className,
  user,
  kycStatus
}: {
  className?: string
  user: UserWithAddresses
  kycStatus?: string
}) => {
  const { data: session } = useSession()
  const username = useUsername(user)

  const { data: citizen } = useCitizen({
    query: { type: CITIZEN_TYPES.user, id: user.id },
  })
  const [isCitizen, setIsCitizen] = useState(false)
  const isVerified = kycStatus === "APPROVED"

  useEffect(() => {
    if (
      citizen &&
      citizen.attestationId &&
      citizen.type === CITIZEN_TYPES.user
    ) {
      setIsCitizen(true)
    }
  }, [citizen])

  const isSelf = session?.user?.id === user.id

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <div className="flex flex-col space-y-6">
        {user.imageUrl && (
          <Avatar className="relative w-20 h-20 my-0.5 ml-3">
            <AvatarImage src={user.imageUrl} className="object-cover" />
            {isSelf && (
              <Link href="/profile/details">
                <AvatarBadge className="absolute w-[40px] h-[40px] top-[20px] right-0 bg-white hover:bg-secondary border border-muted/50 hover:border-muted rounded-full">
                  <PencilFill className="w-[18px] h-[18px]" fill="#0F111A" />
                </AvatarBadge>
              </Link>
            )}
          </Avatar>
        )}
        <div className="flex flex-col gap-6">
          <div className="text-3xl font-semibold flex flex-wrap items-center gap-2">
            {username}
            <div className="flex items-center gap-1 ml-2">
              {isCitizen && <CitizenshipBadge variant="icon" />}
              {isVerified && <VerifiedBadge />}
            </div>
          </div>
          <div className="text-sm text-muted-foreground ml-3">{user.bio}</div>
          <ProfileHeaderLinks user={user} />
        </div>
      </div>
    </div>
  )
}

const VerifiedBadge = () => {
  return (
    <div title="Identity verified" className="cursor-default">
      <UserRoundCheck
        fill="#000"
        size={20}
        className="rounded"
      />
    </div>
  )
}

export default ProfileHeader
