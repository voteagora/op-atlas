import Image from "next/image"
import React, { memo } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

  return (
    <div className={cn("flex w-full h-full gap-x-4", className)}>
      <div className="flex flex-col w-full">
        <div className="relative">
          {organization.coverUrl && (
            <div className="relative w-full h-48 -mt-16 overflow-hidden translate-y-1/4 rounded-lg">
              <Image
                src={organization.coverUrl}
                alt={`${organization.name} banner`}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 px-8">
          <Avatar className="w-20 h-20">
            <AvatarImage src={organization.avatarUrl ?? ""} />
            <AvatarFallback>{organization.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col w-full">
            <h2 className="flex items-center gap-x-2">
              {organization.name ?? ""}{" "}
            </h2>
            {organization.description && (
              <p className="text-md text-muted-foreground mt-2">
                {organization.description}
              </p>
            )}
          </div>

          <OrganizationHeaderLinks organization={organization} />
        </div>
      </div>
    </div>
  )
}

export default memo(OrganizationHeader)
