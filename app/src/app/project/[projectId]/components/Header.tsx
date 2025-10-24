"use client"

import { PencilLineIcon } from "lucide-react"
import Image from "next/image"

import TrackedExtendedLink from "@/components/common/TrackedExtendedLink"
import { CheckboxCircleFIll } from "@/components/icons/remix"
import { Avatar, AvatarBadge, AvatarImage } from "@/components/ui/avatar"
import { useMembership } from "@/hooks/project/useMembership"

interface HeaderProps {
  projectId: string
  userId?: string
  thumbnail?: string | null
  banner?: string | null
  citizenAttested?: boolean
}

export default function Header({
  projectId,
  userId,
  thumbnail,
  banner,
  citizenAttested,
}: HeaderProps) {
  const { data: membershipData } = useMembership(projectId, userId)
  const isMember = membershipData?.isMember ?? false
  return (
    <div className="w-full relative">
      {banner && (
        <div className="relative">
          {isMember && (
            <TrackedExtendedLink
              as="button"
              href={`/projects/${projectId}/details`}
              text="Edit"
              icon={<PencilLineIcon size={16} fill="#000" />}
              className="absolute top-9 right-6 z-[100]"
              eventName="Link Click"
              eventData={{
                projectId,
                source: "project_page",
                linkName: "Edit Project",
                isContributor: isMember,
              }}
            />
          )}

          <div className="flex items-center justify-center w-full h-[120px] lg:h-[280px] bg-[#FBFCFE] overflow-hidden lg:rounded-2xl">
            <Image
              src={banner}
              width={1024}
              height={280}
              alt="Project banner"
              className="w-full h-full object-cover object-center lg:rounded-2xl"
            />
          </div>
        </div>
      )}
      {thumbnail && (
        <div className="absolute -bottom-11 lg:-bottom-10 left-6 lg:left-12 aspect-square">
          <Avatar className="w-16 h-16 lg:w-28 lg:h-28 border border-[#FBFCFE] rounded-lg lg:rounded-xl">
            <AvatarImage
              src={thumbnail}
              alt="avatar"
              className="rounded-lg lg:rounded-xl"
            />
            {citizenAttested && (
              <AvatarBadge className="absolute w-[20px] h-[20px] top-[20px] right-0 bg-white rounded-full">
                <CheckboxCircleFIll
                  className="w-[20px] h-[20px]"
                  fill="#FF0000"
                />
              </AvatarBadge>
            )}
          </Avatar>
        </div>
      )}
    </div>
  )
}
