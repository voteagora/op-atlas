import { User } from "@prisma/client"
import { ArrowUpRight, Ellipsis } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import React, { memo } from "react"

import { isBadgeholderAddress } from "@/lib/badgeholders"
import { UserWithAddresses } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useAppDialogs } from "@/providers/DialogProvider"

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

const ProfileDetailCard = ({
  className,
  user,
}: {
  className?: string
  user: UserWithAddresses
}) => {
  const { setOpenDialog } = useAppDialogs()

  const initials = (user?.name ?? "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const isBadgeholder = user.addresses?.find(({ address }) =>
    isBadgeholderAddress(address),
  )

  return (
    <div className={cn("flex gap-x-4", className)}>
      <Avatar className="w-20 h-20 my-0.5">
        <AvatarImage src={user?.imageUrl ?? ""} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col">
        <h2 className="flex items-center gap-x-2">
          {user.name ?? ""}{" "}
          {isBadgeholder && (
            <Image
              src="/assets/icons/badgeholder-sunny.png"
              width={14}
              height={14}
              alt="Badgeholder checkmark"
            />
          )}
        </h2>
        {user.bio && <p>{user.bio}</p>}

        <div className="mt-2 mr-4 flex items-center gap-x-4">
          <p className="text-sm text-muted-foreground">
            Username{" "}
            <span className="font-medium text-secondary-foreground">
              @{user.username}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Email
            <Button
              variant="link"
              onClick={() => setOpenDialog("email")}
              className="font-medium text-secondary-foreground m-0 ml-1 p-0 h-fit"
            >
              {user.email ? user.email : "Add your email"}
            </Button>
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="ml-auto">
            <Ellipsis size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <Link href="/profile/details">
            <DropdownMenuItem className="cursor-pointer">
              Edit your profile
            </DropdownMenuItem>
          </Link>
          <Link href="/projects/new">
            <DropdownMenuItem className="cursor-pointer">
              Add a project
            </DropdownMenuItem>
          </Link>
          <Link href="profile/organizations/new">
            <DropdownMenuItem className="cursor-pointer">
              Make an organization
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator className="mx-1 opacity-50" />
          <Link href={`/${user.username}`}>
            <DropdownMenuItem className="cursor-pointer flex items-center justify-between">
              View public profile
              <ArrowUpRight size={16} />
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default memo(ProfileDetailCard)
