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

import { UserForm } from "./UserForm"

type SelectedEntity = {
  name: string
  avatar?: string
  userId?: string
  organizationId?: string
}

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

  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity>({
    name: `${username} (You)`,
    avatar: user.imageUrl || undefined,
    userId: user.id,
    organizationId: undefined,
  })

  const handleSelectEntity = (entity: SelectedEntity) => {
    setSelectedEntity(entity)
  }

  return (
    <div className="flex flex-col gap-12 w-full">
      <div className="flex flex-col gap-4">
        <div className="text-xl font-semibold">Nominate as:</div>

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
                  userId: user.id,
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

            {userOrgs.map((userOrg) => (
              <DropdownMenuItem
                key={userOrg.organizationId}
                className="cursor-pointer"
                onClick={() =>
                  handleSelectEntity({
                    organizationId: userOrg.organizationId,
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

      <UserForm user={user} role={role} selectedEntity={selectedEntity} />
    </div>
  )
}
