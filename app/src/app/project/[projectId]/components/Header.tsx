"use client"

import { PencilLineIcon } from "lucide-react"
import Image from "next/image"
import React from "react"

import TrackedExtendedLink from "@/components/common/TrackedExtendedLink"
import { CheckboxCircleFIll } from "@/components/icons/remix"
import { Avatar, AvatarBadge, AvatarImage } from "@/components/ui/avatar"
import { useCitizen } from "@/hooks/citizen/useCitizen"
import { CITIZEN_TYPES } from "@/lib/constants"

interface HeaderProps {
  projectId: string
  isMember?: boolean
  thumbnail?: string | null
  banner?: string | null
}

export default function Header({
  projectId,
  isMember,
  thumbnail,
  banner,
}: HeaderProps) {
  const { data: citizen } = useCitizen({
    query: { type: CITIZEN_TYPES.app, id: projectId },
  })

  return (
    <div className="w-full relative">
      {banner ? (
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

          <div className="flex items-center justify-center w-full h-[280px] bg-[#FBFCFE] overflow-hidden rounded-2xl">
            <Image
              src={banner}
              layout="responsive"
              width={1024}
              height={280}
              objectFit="cover"
              alt="Project banner"
              className="w-full h-full object-cover object-center rounded-2xl"
            />
          </div>
        </div>
      ) : (
        <div className="w-full h-[80px]" />
      )}
      {thumbnail && (
        <div className="absolute -bottom-10 left-12 aspect-square">
          <Avatar className="w-28 h-28 border  border-[#FBFCFE] rounded-xl">
            <AvatarImage src={thumbnail} alt="avatar" className="rounded-xl" />
            {citizen && citizen.attestationId && (
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
