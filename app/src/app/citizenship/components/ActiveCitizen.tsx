"use client"

import { UserAvatar } from "@/components/common/UserAvatar"
import { CheckboxCircleFIll, UserFill } from "@/components/icons/remix"
import { Avatar, AvatarBadge, AvatarImage } from "@/components/ui/avatar"
import { useCitizen } from "@/hooks/citizen/useCitizen"
import { useOrganization } from "@/hooks/db/useOrganization"
import { useProject } from "@/hooks/db/useProject"
import { CITIZEN_TYPES } from "@/lib/constants"
import { UserWithEmails } from "@/lib/types"

export const ActiveCitizen = ({ user }: { user: UserWithEmails }) => {
  const { data: citizen } = useCitizen({
    query: { type: CITIZEN_TYPES.user, id: user.id },
  })

  const { data: organization } = useOrganization({
    id: citizen?.organizationId ?? "",
    enabled: !!citizen?.organizationId,
  })

  const { data: project } = useProject({
    id: citizen?.projectId ?? "",
    enabled: !!citizen?.projectId,
  })

  const renderAvatar = () => {
    if (citizen?.type === CITIZEN_TYPES.user) {
      return (
        <UserAvatar imageUrl={user.imageUrl}>
          <AvatarBadge className="absolute w-[20px] h-[20px] top-[20px] right-0 bg-white rounded-full">
            <CheckboxCircleFIll className="w-[20px] h-[20px]" fill="#FF0000" />
          </AvatarBadge>
        </UserAvatar>
      )
    }

    if (citizen?.type === CITIZEN_TYPES.chain) {
      return (
        <Avatar className="w-20 h-20">
          {organization?.avatarUrl ? (
            <AvatarImage
              src={organization.avatarUrl}
              alt="avatar"
              className="rounded-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-md flex items-center justify-center bg-muted">
              <UserFill className="w-8 h-8" />
            </div>
          )}

          <AvatarBadge className="absolute w-[20px] h-[20px] top-[20px] right-0 bg-white rounded-full">
            <CheckboxCircleFIll className="w-[20px] h-[20px]" fill="#FF0000" />
          </AvatarBadge>
        </Avatar>
      )
    }

    if (citizen?.type === CITIZEN_TYPES.app) {
      return (
        <Avatar className="w-20 h-20">
          {project?.thumbnailUrl ? (
            <AvatarImage
              src={project?.thumbnailUrl}
              alt="avatar"
              className="rounded-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-md flex items-center justify-center bg-muted">
              <UserFill className="w-8 h-8" />
            </div>
          )}

          <AvatarBadge className="absolute w-[20px] h-[20px] top-[20px] right-0 bg-white rounded-full">
            <CheckboxCircleFIll className="w-[20px] h-[20px]" fill="#FF0000" />
          </AvatarBadge>
        </Avatar>
      )
    }

    return (
      <Avatar className="w-20 h-20">
        <AvatarBadge className="absolute w-[20px] h-[20px] top-[20px] right-0 bg-white rounded-full">
          <CheckboxCircleFIll className="w-[20px] h-[20px]" fill="#FF0000" />
        </AvatarBadge>
      </Avatar>
    )
  }

  // TODO: Add this back in after the release
  // Join the{" "}
  //         <Link href="#" target="_blank" className="underline">
  //           Citizens&apos; House Announcements Group
  //         </Link>{" "}
  //         on Telegram for important messages.

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 w-full">
      {renderAvatar()}
      <div className="flex flex-col items-center justify-center gap-12 max-w-[712px]">
        <div className="text-xl font-normal">Welcome, Citizen!</div>
        <div className="text-center text-lg">
          You are now a member of the Citizens&apos; House. Your votes help
          shape the future of the Optimism Collective.
        </div>
        <div className="text-sm text-muted-foreground text-center">
          We&apos;ll send emails to{" "}
          <span className="font-normal text-red-500">
            {user.emails[0].email}
          </span>{" "}
          for future votes.
        </div>
      </div>
    </div>
  )
}
