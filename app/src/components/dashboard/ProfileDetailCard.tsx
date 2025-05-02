"use client"

import { ArrowUpRight, Ellipsis } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { memo } from "react"

import { useIsBadgeholder } from "@/lib/hooks"
import { UserWithAddresses } from "@/lib/types"
import { cn } from "@/lib/utils"

import { useUser } from "@/hooks/db/useUser"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { usePrivyEmail } from "@/hooks/privy/usePrivyLinkEmail"
import { useUsername } from "@/hooks/useUsername"

const ProfileDetailCard = ({
  className,
  user,
}: {
  className?: string
  user: UserWithAddresses
}) => {
  const { isBadgeholder } = useIsBadgeholder(user)
  const { user: loadedUser } = useUser({ id: user.id, enabled: true })

  const username = useUsername(loadedUser)
  const { linkEmail } = usePrivyEmail(user.id)

  const email = loadedUser
    ? loadedUser?.emails[0]?.email
    : user.emails[0]?.email
  const name = loadedUser ? loadedUser?.name : user.name

  const renderEmail = () => {
    if (email) {
      return (
        <div>
          Email{" "}
          <span className="font-medium text-secondary-foreground">{email}</span>
        </div>
      )
    } else {
      return (
        <Button
          variant="link"
          onClick={() => {
            linkEmail()
          }}
          className="font-medium text-secondary-foreground m-0 ml-1 p-0 h-fit"
        >
          Add your email
        </Button>
      )
    }
  }

  return (
    <div className={cn("flex gap-x-4", className)}>
      <Avatar className="w-20 h-20 my-0.5">
        <AvatarImage src={user?.imageUrl ?? ""} />
        <AvatarFallback>
          <Image
            src="/assets/icons/user-icon.svg"
            alt="user"
            width={18}
            height={18}
            className="text-foreground"
          />
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col">
        <div className="text-2xl font-semibold flex items-center gap-x-2">
          {name || ""}
          {isBadgeholder && (
            <Image
              src="/assets/icons/badgeholder-sunny.png"
              width={14}
              height={14}
              alt="Badgeholder checkmark"
            />
          )}
        </div>

        {user.bio && <p>{user.bio}</p>}

        <div className="mt-2 mr-4 flex items-center gap-x-4">
          <p className="text-sm text-muted-foreground">
            Username{" "}
            <span className="font-medium text-secondary-foreground">
              {username}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">{renderEmail()}</p>
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
