"use client"

import { User } from "@prisma/client"

import { UserAvatarLarge } from "@/components/common/UserAvatarLarge"
import { CheckboxCircleFIll } from "@/components/icons/reminx"
import { AvatarBadge } from "@/components/ui/avatar"

export const ActiveCitizen = ({ user }: { user: User }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-8">
      <UserAvatarLarge imageUrl={user.imageUrl}>
        <AvatarBadge className="absolute w-[20px] h-[20px] top-[20px] right-0 bg-white rounded-full">
          <CheckboxCircleFIll className="w-[20px] h-[20px]" fill="#FF0000" />
        </AvatarBadge>
      </UserAvatarLarge>
      <div className="text-xl font-semibold">Welcome, Citizen!</div>
      <div className="text-center">
        {`You are now a member of the Citizens' House. Your votes help shape the future of the Optimism Collective.`}
      </div>
    </div>
  )
}
