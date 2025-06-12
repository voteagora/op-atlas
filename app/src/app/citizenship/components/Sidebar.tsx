"use client"

import { User } from "@prisma/client"
import Image from "next/image"
import { useState } from "react"

import { UserAvatarLarge } from "@/components/common/UserAvatarLarge"
import CitizenshipApplicationDialog from "@/components/dialogs/CitizenshipApplicationDialog"
import { Button } from "@/components/ui/button"
import { useCitizenshipRequirements } from "@/hooks/citizen/useCitizenshipRequirements"
import { CITIZEN_TYPES } from "@/lib/constants"
import { CitizenshipQualification } from "@/lib/types"

export const Sidebar = ({
  user,
  qualification,
}: {
  user: User
  qualification: CitizenshipQualification
}) => {
  const { hasMetRequirements, isLoading } = useCitizenshipRequirements({
    id: user.id,
    qualification,
  })
  const [isRulesDialogOpen, setIsRulesDialogOpen] = useState(false)

  const renderAvatar = () => {
    if (qualification.type === CITIZEN_TYPES.user) {
      return <UserAvatarLarge imageUrl={user?.imageUrl} />
    }

    return qualification.avatar ? (
      <Image
        className="w-[64px] h-[64px] rounded-md"
        src={qualification.avatar || ""}
        alt={qualification.title}
        width={64}
        height={64}
      />
    ) : (
      <div className="w-[64px] h-[64px] rounded-md bg-muted" />
    )
  }

  const renderCopy = () => {
    if (qualification.type === CITIZEN_TYPES.user) {
      return qualification.eligible
        ? `You are eligible to become a Citizen`
        : qualification.error
    }

    if (qualification.type === CITIZEN_TYPES.chain) {
      return qualification.eligible
        ? `${qualification.title} is eligible to become a Citizen`
        : qualification.error
    }

    if (qualification.type === CITIZEN_TYPES.app) {
      return qualification.eligible
        ? `${qualification.title} is eligible to become a Citizen`
        : qualification.error
    }
  }

  return (
    <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
      {renderAvatar()}

      <div className="text-sm font-semibold text-secondary-foreground">
        {renderCopy()}
      </div>

      {qualification.eligible && isLoading && (
        <div className="text-sm text-secondary-foreground">
          {" "}
          Checking requirements...
        </div>
      )}

      {qualification.eligible && !hasMetRequirements && !isLoading && (
        <div className="text-sm text-destructive">
          {" "}
          Complete your registration requirements in order to continue
        </div>
      )}

      {qualification.eligible && (
        <Button
          className="w-full button-primary"
          disabled={!hasMetRequirements || isLoading}
          onClick={() => setIsRulesDialogOpen(true)}
        >
          Register
        </Button>
      )}

      <CitizenshipApplicationDialog
        open={isRulesDialogOpen}
        onOpenChange={setIsRulesDialogOpen}
      />
    </div>
  )
}
