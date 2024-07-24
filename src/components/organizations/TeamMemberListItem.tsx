import { Ellipsis } from "lucide-react"
import Image from "next/image"
import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

interface TeamMemberListItemProps {
  onRemove: () => void
}

const TeamMemberListItem = ({ onRemove }: TeamMemberListItemProps) => {
  return (
    <div className="py-2 px-3 rounded-md border border-input flex items-center gap-2">
      <Avatar className="!w-6 !h-6">
        <AvatarImage src={""} alt="avatar" />
        <AvatarFallback>Fazle</AvatarFallback>
      </Avatar>
      <p className="text-sm text-foreground">Shaun Lind (You)</p>
      <DropdownMenu>
        <DropdownMenuTrigger className="ml-auto" asChild>
          <Button
            variant="ghost"
            className="text-sm font-normal text-secondary-foreground focus-visible:ring-0"
          >
            Contributor
            <Image
              src="/assets/icons/arrowDownIcon.svg"
              height={8}
              width={10}
              alt="Arrow up"
              className="ml-2"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuCheckboxItem
            className="text-sm font-normal"
            checked={false}
          >
            Admin
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            className="text-sm font-normal"
            checked={true}
          >
            Contributor
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onRemove} className="cursor-pointer">
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default TeamMemberListItem
