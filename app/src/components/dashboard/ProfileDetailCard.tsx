"use client"

import { ArrowUpRight, Ellipsis, UserRoundCheck } from "lucide-react"
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
import { UserKYCStatus } from "@/lib/actions/userKyc"

import { UserAvatar } from "../common/UserAvatar"
import { CitizenshipBadge } from "../common/CitizenshipBadge"
import { Badge } from "../common/Badge"
import ImportFromFarcasterDialog from "../dialogs/ImportFromFarcasterDialog"
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
  userKYCStatus,
}: {
  user: UserWithAddresses
  userKYCStatus?: UserKYCStatus
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

      <div className="flex flex-col justify-center">
        <div className="text-2xl font-normal flex items-center gap-x-2">
          {username || ""}
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

        <div className="mt-2 mr-4 flex items-center gap-2 flex-wrap">
          {/* Citizenship Badge */}
          {isCitizen && <CitizenshipBadge variant="full" />}

          {/* Username Badge */}
          {user.username && user.farcasterId ? (
            <Badge text={`@${user.username}`} className="bg-secondary text-secondary-foreground px-2 py-1" />
          ) : (
            <Badge
              as="button"
              text="Add details"
              leftIcon="/assets/icons/plus.svg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-2 py-1"
              onClick={() => window.location.href = '/profile/details'}
            />
          )}

          {/* Email Badge */}
          {email ? (
            <Badge text={email} className="bg-secondary text-secondary-foreground px-2 py-1" />
          ) : (
            <Badge
              as="button"
              text="Add email"
              leftIcon="/assets/icons/plus.svg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-2 py-1"
              onClick={() => linkEmail()}
            />
          )}

          {/* KYC Verification Badge */}
          {userKYCStatus && (
            userKYCStatus.hasApprovedKYC ? (
              <Badge
                text={
                  <span className="flex items-center gap-1">
                    <UserRoundCheck fill="#000" size={12} />
                    Verified
                  </span>
                }
                className="bg-secondary text-secondary-foreground px-2 py-1"
              />
            ) : (
              <Badge
                as="button"
                text="Verify your identity"
                leftIcon="/assets/icons/plus.svg"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-2 py-1"
                onClick={() => window.location.href = '/profile/details'}
              />
            )
          )}
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
