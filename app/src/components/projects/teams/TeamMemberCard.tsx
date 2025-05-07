import { User } from "@prisma/client"
import Image from "next/image"
import { memo, useState } from "react"

import { UserAvatarSmall } from "@/components/common/UserAvatarSmall"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUser } from "@/hooks/db/useUser"
import { useUsername } from "@/hooks/useUsername"
import { TeamRole } from "@/lib/types"

export const TeamMemberCard = memo(function TeamMemberCard({
  user,
  role,
  isUserAdmin,
  onToggleAdmin,
  onRemove,
  isCurrentUser,
  organizationName,
}: {
  user: User
  role: TeamRole
  isUserAdmin: boolean
  isCurrentUser: boolean
  onToggleAdmin: () => void
  onRemove: () => void
  organizationName?: string
}) {
  const [showingMenu, setShowingMenu] = useState(false)
  const [mouseEntered, setMouseEntered] = useState(false)

  const { user: loadedUser } = useUser({ id: user.id })
  const username = useUsername(loadedUser)

  return (
    <div
      onMouseEnter={() => setMouseEntered(true)}
      onMouseLeave={() => setMouseEntered(false)}
    >
      <div className="py-2 px-3 rounded-md border border-input flex items-center gap-2 w-full h-10">
        <UserAvatarSmall imageUrl={user?.imageUrl} />
        <p className="text-sm text-foreground">
          {username} {isCurrentUser && "(You)"}
        </p>
        {/* this badge will be shown when according to project organization for now I am just showing dummy */}
        {organizationName && (
          <Badge
            variant="secondary"
            className="text-xs font-medium text-secondary-foreground"
          >
            {organizationName}
          </Badge>
        )}

        <DropdownMenu onOpenChange={setShowingMenu}>
          <DropdownMenuTrigger
            className="ml-auto"
            asChild
            style={showingMenu || mouseEntered ? { visibility: "visible" } : {}}
          >
            <Button
              variant="ghost"
              className="text-sm font-normal text-secondary-foreground focus-visible:ring-0 p-0"
            >
              {role === "admin" ? "Admin" : "Contributor"}
              {isUserAdmin && !isCurrentUser && !organizationName && (
                <Image
                  src="/assets/icons/arrowDownIcon.svg"
                  height={8}
                  width={10}
                  alt="Arrow up"
                  className="ml-2"
                />
              )}
            </Button>
          </DropdownMenuTrigger>
          {isUserAdmin && !isCurrentUser && !organizationName && (
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                onClick={onToggleAdmin}
                className="text-sm font-normal"
                checked={role !== "member"}
              >
                Admin
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                onClick={onToggleAdmin}
                className="text-sm font-normal"
                checked={role === "member"}
              >
                Contributor
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onRemove} className="cursor-pointer">
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </div>
    </div>
  )
})
