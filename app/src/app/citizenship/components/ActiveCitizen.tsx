"use client"

import Link from "next/link"

import { UserAvatarLarge } from "@/components/common/UserAvatarLarge"
import { CheckboxCircleFIll } from "@/components/icons/reminx"
import { AvatarBadge } from "@/components/ui/avatar"
import { UserWithEmails } from "@/lib/types"

export const ActiveCitizen = ({ user }: { user: UserWithEmails }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 w-full">
      <UserAvatarLarge imageUrl={user.imageUrl}>
        <AvatarBadge className="absolute w-[20px] h-[20px] top-[20px] right-0 bg-white rounded-full">
          <CheckboxCircleFIll className="w-[20px] h-[20px]" fill="#FF0000" />
        </AvatarBadge>
      </UserAvatarLarge>
      <div className="flex flex-col items-center justify-center gap-12 max-w-[712px]">
        <div className="text-xl font-semibold">Welcome, Citizen!</div>
        <div className="text-center text-lg">
          You are now a member of the Citizens&apos; House. Your votes help
          shape the future of the Optimism Collective.
        </div>
        <div className="text-sm text-muted-foreground text-center">
          Join the{" "}
          <Link
            href="https://t.me/citizenshouseannouncements"
            target="_blank"
            className="underline"
          >
            Citizens&apos; House Announcements Group
          </Link>{" "}
          on Telegram for important messages. We&apos;ll send emails to{" "}
          <span className="font-semibold text-red-500">
            {user.emails[0].email}
          </span>{" "}
          for future votes.
        </div>
      </div>
    </div>
  )
}
