"use client"

import { User } from "@prisma/client"
import Image from "next/image"
import { useState } from "react"

import { UserAvatarLarge } from "@/components/common/UserAvatarLarge"
import CitizenshipRulesDialog from "@/components/dialogs/CitizenshipRulesDialog"
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
  const isEligible = useCitizenshipRequirements({ id: user.id, qualification })
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
      return `You are eligible to become a Citizen`
    }
    return `${qualification.title} is eligible to become a Citizen`
  }

  return (
    <div className="w-full flex flex-col text-center items-center gap-6 border border-border-secondary rounded-lg p-6">
      {renderAvatar()}

      <div className="text-sm font-semibold text-secondary-foreground">
        {renderCopy()}
      </div>

      {!isEligible && (
        <div className="text-sm text-destructive">
          {" "}
          Complete your registration requirements in order to continue
        </div>
      )}

      <Button
        className="w-full button-primary"
        disabled={!isEligible}
        onClick={() => setIsRulesDialogOpen(true)}
      >
        Register
      </Button>

      <CitizenshipRulesDialog
        open={isRulesDialogOpen}
        onOpenChange={setIsRulesDialogOpen}
      />
    </div>
  )
}
