"use client"

import { Citizen, User } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import { UserAvatar } from "@/components/common/UserAvatar"
import CitizenshipResignDialog from "@/components/dialogs/CitizenshipResignDialog"
import { Button } from "@/components/ui/button"
import { useOrganization } from "@/hooks/db/useOrganization"
import { useProject } from "@/hooks/db/useProject"
import { useUser } from "@/hooks/db/useUser"
import { useUsername } from "@/hooks/useUsername"
import { CITIZEN_TYPES } from "@/lib/constants"
import { CitizenshipQualification } from "@/lib/types"

type Props = {
  user: User
  qualification: CitizenshipQualification
  citizen: Citizen
}

export const SidebarActiveCitizen = ({
  user,
  qualification,
  citizen,
}: Props) => {
  const [citizenTitle, setCitizenTitle] = useState<string | null>(null)
  const [citizenAvatar, setCitizenAvatar] = useState<string | null>(null)

  const { user: citizenUser } = useUser({
    id: citizen.userId,
    enabled: qualification.type !== CITIZEN_TYPES.user,
  })

  const username = useUsername(citizenUser)

  const { data: project } = useProject({
    id: citizen.projectId ?? "",
    enabled: citizen.type === CITIZEN_TYPES.app,
  })

  const { data: organization } = useOrganization({
    id: citizen.organizationId ?? "",
    enabled: citizen.type === CITIZEN_TYPES.chain,
  })

  const [isResignDialogOpen, setIsResignDialogOpen] = useState(false)

  useEffect(() => {
    if (citizen.type === CITIZEN_TYPES.app && project) {
      setCitizenTitle(project.name)
      setCitizenAvatar(project.thumbnailUrl)
    }
    if (citizen.type === CITIZEN_TYPES.chain && organization) {
      setCitizenTitle(organization.name)
      setCitizenAvatar(organization.avatarUrl)
    }

    if (citizen.type === CITIZEN_TYPES.user) {
      setCitizenTitle("You are")
      setCitizenAvatar(user.imageUrl ?? null)
    }
  }, [project, organization, username, citizen, user])

  return (
    <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
      {citizen.type === CITIZEN_TYPES.user ? (
        <UserAvatar imageUrl={citizenAvatar} size="lg" />
      ) : (
        <div>
          {citizenAvatar ? (
            <Image
              className="w-[64px] h-[64px] rounded-md"
              src={citizenAvatar}
              alt={citizenTitle ?? ""}
              width={64}
              height={64}
            />
          ) : (
            <div className="w-[64px] h-[64px] rounded-md bg-muted" />
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="text-sm font-semibold text-secondary-foreground">
          {citizenTitle} is a citizen!
        </div>

        {citizen.type === CITIZEN_TYPES.user ? (
          <div className="text-sm text-secondary-foreground">
            You&apos;ll receive emails about active proposals.
          </div>
        ) : (
          <div className="text-sm text-secondary-foreground">
            <Link
              target="_blank"
              className="underline"
              href={`/${citizenUser?.username}`}
            >
              {username}
            </Link>{" "}
            holds the voting badge for this app and is responsible for casting
            votes.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 w-full">
        <Link href="/governance">
          <Button className="w-full button-primary">Start participating</Button>
        </Link>

        <Button
          className="w-full button-outline"
          onClick={() => setIsResignDialogOpen(true)}
        >
          {citizen.type !== CITIZEN_TYPES.user ? "Edit or resign" : "Resign"}
        </Button>
      </div>

      <CitizenshipResignDialog
        open={isResignDialogOpen}
        onOpenChange={setIsResignDialogOpen}
        citizen={citizen}
      />
    </div>
  )
}
