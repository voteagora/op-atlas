import { User } from "@prisma/client"
import Image from "next/image"
import { memo, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TeamRole } from "@/lib/types"

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

  return (
    <div
      onMouseEnter={() => setMouseEntered(true)}
      onMouseLeave={() => setMouseEntered(false)}
    >
      <div className="py-2 px-3 h-10 rounded-md border border-input flex items-center gap-2 w-full">
        <Avatar className="!w-6 !h-6">
          <AvatarImage src={user.imageUrl || ""} alt="team avatar" />
          <AvatarFallback>{user.username} </AvatarFallback>
        </Avatar>
        <p className="text-sm text-foreground">
          {user.username} {isCurrentUser && "(You)"}
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
