"use client"

import { Role, User } from "@prisma/client"
import Image from "next/image"
import { useState } from "react"

import { UserAvatarSmall } from "@/components/common/UserAvatarSmall"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUsername } from "@/hooks/useUsername"
import { UserOrganizationsWithDetails } from "@/lib/types"

export const Form = ({
  role,
  user,
  userOrgs,
}: {
  role: Role
  user: User
  userOrgs: UserOrganizationsWithDetails[]
}) => {
  const username = useUsername(user)

  const [selectedEntity, setSelectedEntity] = useState<{
    type: "user" | "organization"
    source: "user" | "organization"
    id: string
    name: string
    avatar?: string
  }>({
    type: "user",
    source: "user",
    id: user.id,
    name: user.name || user.username || "User",
    avatar: user.imageUrl || undefined,
  })

  const handleSelectEntity = (entity: {
    type: "user" | "organization"
    source: "user" | "organization"
    id: string
    name: string
    avatar?: string
  }) => {
    setSelectedEntity(entity)
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="text-lg font-semibold">Nominate as:</div>

      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <Button
            variant="outline"
            className="h-12 px-3 flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-3">
              <UserAvatarSmall imageUrl={selectedEntity.avatar || ""} />
              <span className="text-sm text-secondary-foreground font-normal">
                {selectedEntity.name}
              </span>
            </div>
            <Image
              src="/assets/icons/arrowDownIcon.svg"
              height={8}
              width={10}
              alt="Arrow down"
              className="ml-auto"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full">
          {/* User option */}
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() =>
              handleSelectEntity({
                type: "user",
                source: "user",
                id: user.id,
                name: `${username} (You)`,
                avatar: user.imageUrl || undefined,
              })
            }
          >
            <div className="flex items-center gap-3">
              <UserAvatarSmall imageUrl={user.imageUrl} />
              <div className="text-sm text-secondary-foreground font-normal">
                {username} (You)
              </div>
            </div>
          </DropdownMenuItem>

          {/* Organization options */}
          {userOrgs.map((userOrg) => (
            <DropdownMenuItem
              key={userOrg.organizationId}
              className="cursor-pointer"
              onClick={() =>
                handleSelectEntity({
                  type: "organization",
                  source: "organization",
                  id: userOrg.organizationId,
                  name: userOrg.organization.name,
                  avatar: userOrg.organization.avatarUrl || undefined,
                })
              }
            >
              <div className="flex items-center gap-3">
                <UserAvatarSmall imageUrl={userOrg.organization.avatarUrl} />
                <div className="text-sm text-secondary-foreground font-normal">
                  {userOrg.organization.name}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
