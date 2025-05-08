import { User } from "@prisma/client"
import Image from "next/image"
import { memo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUsername } from "@/hooks/useUsername"
import { TeamRole } from "@/lib/types"
import { UserAvatarSmall } from "../common/UserAvatarSmall"
import { useUser } from "@/hooks/db/useUser"

export const TeamMemberRow = memo(function TeamMemberRow({
  user,
  role,
  isUserAdmin,
  onToggleAdmin,
  onRemove,
  isCurrentUser,
}: {
  user: User
  role: TeamRole
  isUserAdmin: boolean
  isCurrentUser: boolean
  onToggleAdmin: (selectedRole: TeamRole) => void
  onRemove: () => void
}) {
  const [showingMenu, setShowingMenu] = useState(false)
  const [mouseEntered, setMouseEntered] = useState(false)

  const { user: loadedUser } = useUser({ id: user.id })
  const username = useUsername(loadedUser || user)


  return (
    <div
      onMouseEnter={() => setMouseEntered(true)}
      onMouseLeave={() => setMouseEntered(false)}
    >
      <div className="py-2 px-3 h-10 rounded-md border border-input flex items-center gap-2 w-full">
        <UserAvatarSmall imageUrl={user?.imageUrl} />
        <p className="text-sm text-foreground">
          {username} {isCurrentUser && "(You)"}
        </p>

        <DropdownMenu onOpenChange={setShowingMenu}>
          <DropdownMenuTrigger
            className="ml-auto"
            asChild
            style={showingMenu || mouseEntered ? { visibility: "visible" } : {}}
          >
            <Button
              variant="ghost"
              className="text-sm p-0 h-fit font-normal text-secondary-foreground focus-visible:ring-0"
            >
              {role === "admin" ? "Admin" : "Contributor"}
              {isUserAdmin && (
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
          {isUserAdmin && (
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                onClick={() => onToggleAdmin("admin")}
                className="text-sm font-normal"
                checked={role !== "member"}
              >
                Admin
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                onClick={() => onToggleAdmin("member")}
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
