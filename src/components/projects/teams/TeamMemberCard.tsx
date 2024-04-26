import { User } from "@prisma/client"
import { Check, Ellipsis } from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TeamRole } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const TeamMemberCard = ({
  user,
  role,
  onToggleAdmin,
  onRemove,
}: {
  user: User
  role: TeamRole
  onToggleAdmin: () => void
  onRemove: () => void
}) => {
  const [showingMenu, setShowingMenu] = useState(false)
  const [mouseEntered, setMouseEntered] = useState(false)

  return (
    <div
      onMouseEnter={() => setMouseEntered(true)}
      onMouseLeave={() => setMouseEntered(false)}
      className="aspect-square flex flex-col items-center justify-center gap-y-2 flex-1 relative border rounded-xl px-4 select-none"
    >
      <DropdownMenu onOpenChange={setShowingMenu}>
        <DropdownMenuTrigger
          className="invisible absolute top-1.5 right-1.5 h-8 w-8 flex items-center justify-center border rounded-md focus-visible:ring-0 focus:outline-none"
          style={showingMenu || mouseEntered ? { visibility: "visible" } : {}}
        >
          <Ellipsis size={14} />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="flex items-center cursor-pointer"
            onClick={onToggleAdmin}
          >
            {role !== "member" && <Check size={14} className="mr-1" />}
            Admin
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={onRemove}>
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="relative w-12 h-12">
        <Avatar className="w-full h-full">
          <AvatarImage src={user.imageUrl ?? undefined} alt="avatar" />
          <AvatarFallback>{user.name?.[0]}</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-col items-center text-center">
        <p className="text-sm">{user.name}</p>
        {role !== "member" && (
          <p className="text-xs text-muted-foreground">Admin</p>
        )}
      </div>
    </div>
  )
}
