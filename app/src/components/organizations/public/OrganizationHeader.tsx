"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import Image from "next/image"
import { memo, useState } from "react"

import { CheckboxCircleFIll } from "@/components/icons/remix"
import { Avatar, AvatarBadge, AvatarImage } from "@/components/ui/avatar"
import { useCitizen } from "@/hooks/citizen/useCitizen"
import { CITIZEN_TYPES } from "@/lib/constants"
import { OrganizationWithTeamAndProjects } from "@/lib/types"
import { cn } from "@/lib/utils"

import OrganizationHeaderLinks from "./OrganizationHeaderLinks"

const OrganizationHeader = ({
  className,
  organization,
}: {
  className?: string
  organization: OrganizationWithTeamAndProjects
}) => {

  const [showMore, setShowMore] = useState(false)
  const { data: citizen } = useCitizen({ query: { type: CITIZEN_TYPES.chain, id: organization.id } })

  return (
    <div className={cn("flex w-full h-full gap-x-4", className)}>
      <div className="flex flex-col w-full">
        <div className="relative">
          <div className="relative w-full h-56 -mt-16 overflow-hidden translate-y-1/4 rounded-xl border border-gray-100">
            {organization.coverUrl ? (
              <Image
                src={organization.coverUrl}
                alt={`${organization.name} banner`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white" />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 px-8">
          <Avatar className="w-28 h-28">
            <AvatarImage src={organization.avatarUrl ?? ""} className="border border-white" />
            {citizen && citizen.attestationId && (
              <AvatarBadge className="absolute w-[20px] h-[20px] top-[20px] right-2 bg-white rounded-full">
                <CheckboxCircleFIll className="w-[20px] h-[20px]" fill="#FF0000" />
              </AvatarBadge>
            )}
          </Avatar>

          <div className="flex flex-col w-full">
            <h2 className="flex items-center gap-x-2">
              {organization.name ?? ""}{" "}
              <span className="text-xs font-normal text-gray-700 border border-gray-200 px-2 py-1 rounded-full">
                Organization
              </span>
            </h2>
            {organization.description && (
              <div>
                <p
                  className={cn(
                    "text-md text-secondary-foreground mt-2",
                    !showMore && "overflow-hidden max-h-[4.5em] relative", // 3 lines
                  )}
                >
                  {organization.description}
                  {!showMore && (
                    <span className="absolute bottom-0 right-0 bg-gradient-to-l from-white dark:from-background pl-2">
                      ...
                    </span>
                  )}
                </p>
                {organization.description &&
                  organization.description.length > 150 && (
                    <button
                      onClick={() => setShowMore(!showMore)}
                      className="text-sm text-gray-500 hover:text-gray-700 mt-2"
                    >
                      <div className="flex items-center gap-x-1">
                        {showMore ? (
                          <>
                            Read less <ChevronUp size={12} />
                          </>
                        ) : (
                          <>
                            Read more <ChevronDown size={12} />
                          </>
                        )}
                      </div>
                    </button>
                  )}
              </div>
            )}
          </div>

          <OrganizationHeaderLinks organization={organization} />
        </div>
      </div>
    </div>
  )
}

export default memo(OrganizationHeader)
