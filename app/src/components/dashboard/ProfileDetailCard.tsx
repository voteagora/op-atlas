"use client"

import { ArrowUpRight, Ellipsis } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { memo, useEffect, useState } from "react"

import { useCitizen } from "@/hooks/citizen/useCitizen"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyEmail } from "@/hooks/privy/usePrivyLinkEmail"
import { useUsername } from "@/hooks/useUsername"
import { CITIZEN_TYPES } from "@/lib/constants"
import { useIsBadgeholder } from "@/lib/hooks"
import { UserWithAddresses } from "@/lib/types"

import { UserAvatar } from "../common/UserAvatar"
import { CitizenshipBadge } from "../common/CitizenshipBadge"
import ImportFromFarcasterDialog from "../dialogs/ImportFromFarcasterDialog"
import { ArrowDropRight } from "../icons/ArrowDropRight"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

const ProfileDetailCard = ({
  user: initialUser,
}: {
  user: UserWithAddresses
}) => {
  const { user: loadedUser } = useUser({ id: initialUser.id, enabled: true })
  const user = loadedUser || initialUser
  const [showImportDialog, setShowImportDialog] = useState(false)

  const { isBadgeholder } = useIsBadgeholder(user)
  const { data: citizen } = useCitizen({
    query: { type: CITIZEN_TYPES.user, id: user.id },
  })
  const [isCitizen, setIsCitizen] = useState(false)
  const { linkEmail } = usePrivyEmail(user.id)

  const username = useUsername(loadedUser)
  const email = user.emails?.[0]?.email

  useEffect(() => {
    if (
      citizen &&
      citizen.attestationId &&
      citizen.type === CITIZEN_TYPES.user
    ) {
      setIsCitizen(true)
    }
  }, [citizen])

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
        >
          Add your email
        </Button>
      )
    }
  }

  const renderUsername = () => {
    if (user.username && user.farcasterId) {
      return (
        <span className="text-secondary-foreground">
          Username: <span className="font-medium">{user.username}</span>
        </span>
      )
    } else {
      return (
        <Link
          href="/profile/details"
          className="hover:underline flex items-center gap-x-0.5"
        >
          Add profile details{" "}
          <ArrowDropRight fill="#6B7280" className="text-muted-foreground" />
        </Link>
      )
    }
  }

  return (
    <div className="flex gap-x-4">
      {user.imageUrl ? (
        <UserAvatar imageUrl={user.imageUrl} />
      ) : (
        <button
          onClick={() => setShowImportDialog(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setShowImportDialog(true)
            }
          }}
          className="w-20 h-20 my-0.5 flex items-center justify-center rounded-full border border-dashed border-muted bg-none hover:bg-secondary group relative cursor-pointer"
          aria-label="Add profile picture"
        >
          <Image
            className="text-foreground group-hover:opacity-0 transition-opacity"
            src="/assets/icons/user-icon.svg"
            alt="user"
            width={18}
            height={18}
          />
          <Image
            className="absolute w-6 h-6 text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            src="/assets/icons/add-line.svg"
            alt="add"
            width={18}
            height={18}
          />
        </button>
      )}

      <div className="flex flex-col">
        <div className="text-2xl font-semibold flex items-center gap-x-2">
          {username || ""}
          {isCitizen && <CitizenshipBadge />}
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

        <div className="mt-2 mr-4 flex items-center gap-x-4 text-sm text-muted-foreground">
          <div>{renderUsername()}</div>
          <div>{renderEmail()}</div>
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

      <ImportFromFarcasterDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />
    </div>
  )
}

export default memo(ProfileDetailCard)
